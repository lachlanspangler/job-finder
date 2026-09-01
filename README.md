# job-finder

A daily job scanner for the biggest tech, AI, and quant companies. It pulls
openings from the public JSON APIs of the **Greenhouse** and **Ashby** applicant-
tracking systems (which most quant shops and AI labs run their boards on),
filters to **new-grad / mid-level** roles, de-duplicates against everything seen
on previous runs, and writes a dated digest of only the *new* postings.

- **No scraping, no dependencies.** Uses the official public board APIs and the
  Python standard library only — nothing to `pip install`.
- **Level filtering.** Drops senior/staff/lead/principal/director titles and any
  role whose description asks for more than `--max-years` years (default 8);
  always keeps explicit new-grad/entry/intern roles.
- **Daily digest.** Tracks seen postings in `seen.json` and writes
  `digests/YYYY-MM-DD.md` with just what's new since the last run.

## Usage

```bash
python3 jobfinder.py                       # new postings since last run
python3 jobfinder.py --all                 # every matching role (ignores history)
python3 jobfinder.py --tag quant --tag ai  # only these company tags
python3 jobfinder.py --role engineer --role research --max-years 5
python3 jobfinder.py --company anthropic    # one company
```

Flags: `--all`, `--max-years N`, `--role SUBSTR` (repeatable), `--tag TAG`
(repeatable: `ai`/`quant`/`fintech`/`tech`), `--company SUBSTR`, `--limit N`,
`--notify` (macOS notification).

## Add companies

Edit `companies.json`. Each entry is `{ name, ats, token, tags }` where `ats` is
`greenhouse` or `ashby`. Validate a token first:

- Greenhouse: `https://boards-api.greenhouse.io/v1/boards/<token>/jobs`
- Ashby: `https://api.ashbyhq.com/posting-api/job-board/<token>`

If it returns JSON with a non-empty `jobs` array, the token works.

## Run it daily

```bash
cp scripts/com.lachlan.jobfinder.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.lachlan.jobfinder.plist
```

Runs at 08:00 daily, appends a digest, and pops a notification with the count.

## Notes / limitations

- Covers companies on Greenhouse/Ashby. Big-tech custom career sites
  (Google/Meta/etc.) need per-site adapters — a `FETCHERS` entry — and are not
  included by default.
- Level filtering is title- and description-heuristic, so an odd title can slip
  through; tune `SENIOR_RE` / `--max-years` to taste.
- Be a good citizen: the scanner paces requests and identifies itself; don't
  crank the company list to thousands and hammer these APIs.
