#!/usr/bin/env python3
"""Daily job finder for tech / AI / quant companies.

Pulls openings from the public JSON APIs of the Greenhouse and Ashby applicant-
tracking systems (the boards most quant shops and AI labs run on), filters to
new-grad / mid-level roles (drops senior+ and anything asking for more years of
experience than --max-years), de-duplicates against everything seen on prior
runs, and writes a dated digest of only the *new* postings.

Standard library only -- no pip install needed. Run daily via launchd/cron.

Examples:
  python3 jobfinder.py                     # new postings since last run
  python3 jobfinder.py --all               # every matching role, ignore history
  python3 jobfinder.py --tag quant --tag ai
  python3 jobfinder.py --role engineer --role research --max-years 5
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SEEN_PATH = ROOT / "seen.json"
DIGEST_DIR = ROOT / "digests"
USER_AGENT = "job-finder/1.0 (personal job search; contact: local user)"
REQUEST_PACING_S = 0.3  # be polite between requests

# Titles that signal a role above "mid level" -- excluded outright.
SENIOR_RE = re.compile(
    r"\b(senior|sr\.?|staff|principal|lead|director|vp|vice\s+president|"
    r"head\s+of|distinguished|fellow|architect|manager|mgr|executive|chief)\b",
    re.IGNORECASE,
)
# Titles that clearly signal early-career -- always kept.
EARLY_RE = re.compile(
    r"\b(new\s*grad|graduate|entry[-\s]?level|junior|jr\.?|associate|intern|"
    r"university|campus|early\s+career|rotational)\b",
    re.IGNORECASE,
)
YEARS_RE = re.compile(r"(\d{1,2})\s*\+?\s*years", re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")


def fetch_json(url: str, timeout: int = 15) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def html_to_text(s: str) -> str:
    return html.unescape(TAG_RE.sub(" ", s or ""))


def max_years_required(text: str) -> int:
    """Largest 'N years' figure mentioned, or 0 if none. Coarse but effective at
    catching '8+ years of experience' style requirements in a description."""
    nums = [int(m) for m in YEARS_RE.findall(text or "")]
    nums = [n for n in nums if n <= 40]  # ignore garbage like years since 1999
    return max(nums) if nums else 0


def normalize_greenhouse(company: dict) -> list[dict]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{company['token']}/jobs?content=true"
    data = fetch_json(url)
    out = []
    for j in data.get("jobs", []):
        loc = (j.get("location") or {}).get("name") or ""
        out.append({
            "company": company["name"],
            "tags": company.get("tags", []),
            "source": "greenhouse",
            "key": f"greenhouse:{company['token']}:{j['id']}",
            "title": (j.get("title") or "").strip(),
            "location": loc,
            "url": j.get("absolute_url") or "",
            "posted": j.get("first_published") or j.get("updated_at") or "",
            "desc": html_to_text(j.get("content", "")),
        })
    return out


def normalize_ashby(company: dict) -> list[dict]:
    url = f"https://api.ashbyhq.com/posting-api/job-board/{company['token']}"
    data = fetch_json(url)
    out = []
    for j in data.get("jobs", []):
        if j.get("isListed") is False:
            continue
        out.append({
            "company": company["name"],
            "tags": company.get("tags", []),
            "source": "ashby",
            "key": f"ashby:{company['token']}:{j['id']}",
            "title": (j.get("title") or "").strip(),
            "location": j.get("location") or ("Remote" if j.get("isRemote") else ""),
            "url": j.get("jobUrl") or j.get("applyUrl") or "",
            "posted": j.get("publishedAt") or "",
            "desc": j.get("descriptionPlain") or "",
        })
    return out


FETCHERS = {"greenhouse": normalize_greenhouse, "ashby": normalize_ashby}


def is_target_level(job: dict, max_years: int) -> bool:
    title = job["title"]
    if EARLY_RE.search(title):
        return True                       # explicit new-grad/entry: always keep
    if SENIOR_RE.search(title):
        return False                      # senior/staff/lead/etc.: drop
    if max_years_required(job["desc"]) > max_years:
        return False                      # asks for more experience than allowed
    return True


def matches_filters(job: dict, roles: list[str], tags: list[str]) -> bool:
    if tags and not (set(t.lower() for t in job["tags"]) & set(tags)):
        return False
    if roles:
        title = job["title"].lower()
        if not any(r.lower() in title for r in roles):
            return False
    return True


def load_seen() -> set[str]:
    if SEEN_PATH.exists():
        return set(json.loads(SEEN_PATH.read_text()))
    return set()


def save_seen(seen: set[str]) -> None:
    SEEN_PATH.write_text(json.dumps(sorted(seen)))


def posted_date(job: dict) -> str:
    return (job.get("posted") or "")[:10]


def humanize_ago(iso: str) -> str:
    """'3d ago' / '5h ago' from an ISO timestamp; 'recently' if unparseable."""
    if not iso:
        return "recently"
    try:
        d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return "recently"
    if d.tzinfo is None:
        d = d.replace(tzinfo=dt.timezone.utc)
    secs = (dt.datetime.now(dt.timezone.utc) - d).total_seconds()
    if secs < 3600:
        return f"{max(0, int(secs // 60))}m ago"
    if secs < 86400:
        return f"{int(secs // 3600)}h ago"
    days = int(secs // 86400)
    if days < 30:
        return f"{days}d ago"
    if days < 365:
        return f"{days // 30}mo ago"
    return f"{days // 365}y ago"


def collapse_locations(jobs: list[dict]) -> list[dict]:
    """Merge the same role posted across many cities into one entry."""
    groups: dict[tuple, dict] = {}
    for j in jobs:
        key = (j["company"], j["title"].lower())
        g = groups.get(key)
        if g is None:
            g = dict(j)
            g["_locs"] = [j["location"]] if j["location"] else []
            groups[key] = g
        else:
            if j["location"] and j["location"] not in g["_locs"]:
                g["_locs"].append(j["location"])
            if j.get("posted", "") > g.get("posted", ""):
                g["posted"] = j["posted"]
    out = []
    for g in groups.values():
        locs = g.pop("_locs", [])
        if locs:
            g["location"] = locs[0] + (f"  +{len(locs) - 1} more" if len(locs) > 1 else "")
        out.append(g)
    return out


def export_site(matched: list[dict], top: int) -> None:
    """Write docs/jobs.json for the static site and refresh the README section."""
    jobs = collapse_locations(matched)
    jobs.sort(key=lambda j: j.get("posted", ""), reverse=True)

    generated = dt.datetime.now(dt.timezone.utc).isoformat()
    docs = ROOT / "docs"
    docs.mkdir(exist_ok=True)
    payload = {
        "generated_at": generated,
        "count": len(jobs),
        "jobs": [
            {k: j.get(k, "") for k in ("company", "title", "location", "url", "posted", "source")}
            | {"tags": j.get("tags", [])}
            for j in jobs[:600]
        ],
    }
    (docs / "jobs.json").write_text(json.dumps(payload))

    rows = [
        f"- [{j['title']}]({j['url']}) — **{j['company']}** · {j['location'] or '—'} · {humanize_ago(j.get('posted', ''))}"
        for j in jobs[:top]
    ]
    block = (
        "<!-- JOBS:START -->\n"
        f"_{len(jobs)} openings · updated {generated[:16]}Z · "
        "[browse the live site »](https://lachlanspangler.github.io/job-finder/)_\n\n"
        + "\n".join(rows)
        + "\n<!-- JOBS:END -->"
    )
    readme = ROOT / "README.md"
    text = readme.read_text()
    if "<!-- JOBS:START -->" in text and "<!-- JOBS:END -->" in text:
        text = re.sub(r"<!-- JOBS:START -->.*?<!-- JOBS:END -->", lambda _m: block, text, flags=re.S)
    else:
        text = text.rstrip() + "\n\n## Recent openings\n\n" + block + "\n"
    readme.write_text(text)
    print(f"exported {len(jobs)} roles to docs/jobs.json and refreshed README (top {top}).")


def notify(text: str) -> None:
    import subprocess
    try:
        subprocess.run(
            ["osascript", "-e", f'display notification "{text}" with title "job-finder"'],
            check=False, capture_output=True,
        )
    except Exception:
        pass


def main() -> int:
    ap = argparse.ArgumentParser(description="Daily tech/AI/quant job finder.")
    ap.add_argument("--all", action="store_true",
                    help="show all matching roles and ignore/skip the seen-history store")
    ap.add_argument("--max-years", type=int, default=8,
                    help="drop roles requiring more than this many years (default 8)")
    ap.add_argument("--role", action="append", default=[],
                    help="only titles containing this substring (repeatable)")
    ap.add_argument("--tag", action="append", default=[],
                    help="only companies with this tag, e.g. quant/ai/fintech/tech (repeatable)")
    ap.add_argument("--company", default="",
                    help="only companies whose name contains this substring")
    ap.add_argument("--limit", type=int, default=0, help="cap number of results shown")
    ap.add_argument("--notify", action="store_true", help="post a macOS notification with the count")
    ap.add_argument("--export", action="store_true",
                    help="write docs/jobs.json for the static site and refresh the README section")
    ap.add_argument("--top", type=int, default=25, help="rows to list in the README (default 25)")
    args = ap.parse_args()

    cfg = json.loads((ROOT / "companies.json").read_text())
    companies = cfg["companies"]
    if args.company:
        companies = [c for c in companies if args.company.lower() in c["name"].lower()]

    tags = [t.lower() for t in args.tag]
    all_jobs, errors = [], []
    for c in companies:
        fetch = FETCHERS.get(c["ats"])
        if not fetch:
            errors.append(f"{c['name']}: unknown ats '{c['ats']}'")
            continue
        try:
            all_jobs.extend(fetch(c))
        except (urllib.error.URLError, urllib.error.HTTPError, ValueError, KeyError) as e:
            errors.append(f"{c['name']}: {e}")
        time.sleep(REQUEST_PACING_S)

    # Filter to target level + user filters.
    matched = [j for j in all_jobs
               if is_target_level(j, args.max_years) and matches_filters(j, args.role, tags)]

    if args.export:
        export_site(matched, args.top)
        if args.notify:
            notify(f"{len(matched)} roles across {len(companies)} companies")
        return 0

    seen = load_seen()
    if args.all:
        show = matched
    else:
        show = [j for j in matched if j["key"] not in seen]

    show.sort(key=lambda j: j.get("posted", ""), reverse=True)  # newest first
    if args.limit:
        show = show[: args.limit]

    # Report.
    today = dt.date.today().isoformat()
    lines = [f"# New job postings — {today}", ""]
    lines.append(f"Scanned {len(companies)} companies, {len(all_jobs)} live postings, "
                 f"{len(matched)} matched target level"
                 + ("" if args.all else f", {len(show)} new since last run") + ".")
    lines.append("")
    for j in show:
        loc = j["location"] or "—"
        lines.append(f"- **{j['title']}** — {j['company']} · {loc} · {posted_date(j)}")
        lines.append(f"  {j['url']}")
    if errors:
        lines.append("")
        lines.append("## Fetch errors")
        lines.extend(f"- {e}" for e in errors)
    report = "\n".join(lines)

    print(report)

    if not args.all:
        DIGEST_DIR.mkdir(exist_ok=True)
        (DIGEST_DIR / f"{today}.md").write_text(report + "\n")
        for j in show:
            seen.add(j["key"])
        # Also mark everything currently matched as seen so a role that ages out
        # of the "new" window isn't re-reported later.
        for j in matched:
            seen.add(j["key"])
        save_seen(seen)

    if args.notify:
        notify(f"{len(show)} new roles across {len(companies)} companies")

    return 0


if __name__ == "__main__":
    sys.exit(main())
