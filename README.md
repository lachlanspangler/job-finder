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
- **Live site + self-updating README.** `--export` writes `docs/jobs.json` for a
  static [GitHub Pages site](https://lachlanspangler.github.io/job-finder/) and
  refreshes the list below.
- **Profile autofill.** A browser userscript ([`autofill/`](autofill/)) fills the
  application form you're viewing from a stored profile — you review and submit.
  Never auto-submits, never touches CAPTCHAs or resume upload.

## Recent openings

<!-- JOBS:START -->
_593 openings · updated 2026-10-03T13:18Z · [browse the live site »](https://lachlanspangler.github.io/job-finder/)_

- [Business System Engineer](https://coreweave.com/careers/job?4717711006&board=coreweave&gh_jid=4717711006) — **CoreWeave** · Sunnyvale, California · 17h ago
- [iOS Developer, International](https://boards.greenhouse.io/robinhood/jobs/8246088?t=gh_src=&gh_jid=8246088) — **Robinhood** · Toronto, Canada · 19h ago
- [Security Engineer](https://www.hudsonrivertrading.com/careers/job/?gh_jid=8244346) — **Hudson River Trading** · Mumbai · 22h ago
- [Software Engineer, Mobile Core (Android)](https://jobs.ashbyhq.com/notion/d82a0b31-59b8-4699-ae8d-6fb3fe47518c) — **Notion** · San Francisco, California · 1d ago
- [Software Engineer, Passport & Commerce, Android](https://careers.airbnb.com/positions/8247303?gh_jid=8247303) — **Airbnb** · Remote, USA · 1d ago
- [Data Scientist II, Applied ML](https://www.brex.com/careers/8783482002?gh_jid=8783482002) — **Brex** · San Francisco, California, United States  +1 more · 1d ago
- [Software Engineer, Mobile Platform (iOS)](https://jobs.ashbyhq.com/notion/95800771-37a4-4226-b03f-d4fc6ea88f65) — **Notion** · San Francisco, California · 1d ago
- [Software Engineer II, Identity and Access Management](https://www.brex.com/careers/8860822002?gh_jid=8860822002) — **Brex** · São Paulo, São Paulo, Brazil · 1d ago
- [Developer Advocate](https://www.asana.com/jobs/apply/8095543?gh_jid=8095543) — **Asana** · San Francisco · 1d ago
- [Software Engineer - Low Level (C++)](https://www.hudsonrivertrading.com/careers/job/?gh_jid=6345536) — **Hudson River Trading** · Hong Kong  +1 more · 1d ago
- [Quantitative Trader - 2027 Micro-Internship Program (January Start)](https://www.oldmissioncapital.com/careers/?gh_jid=8002345003) — **Old Mission** · Chicago, IL, United States · 1d ago
- [Data Centre Facilities Engineer](https://www.janestreet.com/join-jane-street/apply/8783529002?gh_jid=8783529002) — **Jane Street** · Hong Kong, Hong Kong  +1 more · 2d ago
- [Software Engineer, Data Loading Infrastructure](https://www.asana.com/jobs/apply/7962412?gh_jid=7962412) — **Asana** · San Francisco · 2d ago
- [Junior FPGA Engineer](https://job-boards.greenhouse.io/drweng/jobs/8239996) — **DRW** · Singapore  · 2d ago
- [Software Engineer, Passport & Commerce, iOS](https://careers.airbnb.com/positions/8239985?gh_jid=8239985) — **Airbnb** · Remote, USA · 3d ago
- [AI Inference Platform Engineer](https://job-boards.greenhouse.io/drweng/jobs/8230509) — **DRW** · Chicago · 3d ago
- [Backend Engineer - Music](https://jobs.lever.co/spotify/65d6caca-6d7c-4049-8256-a128e0e7249e) — **Spotify** · New York, NY · 3d ago
- [Security Engineer, Detection and Response](https://jobs.ashbyhq.com/notion/06e1d3a8-2706-4ed9-9fe6-8b69607de18e) — **Notion** · San Francisco, California  +1 more · 4d ago
- [Quantitative Trader (PhD)](https://job-boards.greenhouse.io/virtu/jobs/8817686002) — **Virtu Financial** · Austin, TX · 4d ago
- [Cloud Computing Engineer](https://job-boards.greenhouse.io/pdtpartners/jobs/8237144) — **PDT Partners** · New York, NY · 4d ago
- [Backend Engineer II - Data Platform](https://jobs.lever.co/spotify/186b763a-2a61-4563-8813-ff6b40c9c8a7) — **Spotify** · Stockholm · 5d ago
- [Applied AI Engineer](https://www.hudsonrivertrading.com/careers/job/?gh_jid=8234195) — **Hudson River Trading** · London, United Kingdom; New York, NY, United States; Singapore · 7d ago
- [Software Engineer – Query Engines](https://jobs.lever.co/palantir/4056c8f6-0e6a-43f7-b387-4a97bd3dbb19) — **Palantir** · London, United Kingdom  +1 more · 8d ago
- [Software Engineer Intern, Mobile (Winter 2027)](https://jobs.ashbyhq.com/notion/2b587e66-deac-421a-a824-9415ba78b5a7) — **Notion** · San Francisco, California · 8d ago
- [Security Engineer - Detection and Response](https://jobs.lever.co/spotify/cb29d857-395b-401d-9749-367e666ff870) — **Spotify** · New York, NY · 8d ago
<!-- JOBS:END -->

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
