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
_504 openings · updated 2026-10-01T13:04Z · [browse the live site »](https://lachlanspangler.github.io/job-finder/)_

- [Data Centre Facilities Engineer](https://www.janestreet.com/join-jane-street/apply/8859670002?gh_jid=8859670002) — **Jane Street** · Singapore  +1 more · 4h ago
- [Software Engineer, Data Loading Infrastructure](https://www.asana.com/jobs/apply/7962412?gh_jid=7962412) — **Asana** · San Francisco · 18h ago
- [Junior FPGA Engineer](https://job-boards.greenhouse.io/drweng/jobs/8239996) — **DRW** · Singapore  · 20h ago
- [Software Engineer, Passport & Commerce, iOS](https://careers.airbnb.com/positions/8239985?gh_jid=8239985) — **Airbnb** · Remote, USA · 1d ago
- [Software Engineer, Passport & Commerce, Web](https://careers.airbnb.com/positions/8239930?gh_jid=8239930) — **Airbnb** · Remote, USA · 1d ago
- [AI Inference Platform Engineer](https://job-boards.greenhouse.io/drweng/jobs/8230509) — **DRW** · Chicago · 1d ago
- [Backend Engineer - Music](https://jobs.lever.co/spotify/65d6caca-6d7c-4049-8256-a128e0e7249e) — **Spotify** · New York, NY · 1d ago
- [Security Engineer, Detection and Response](https://jobs.ashbyhq.com/notion/06e1d3a8-2706-4ed9-9fe6-8b69607de18e) — **Notion** · San Francisco, California  +1 more · 2d ago
- [Quantitative Trader (PhD)](https://job-boards.greenhouse.io/virtu/jobs/8817686002) — **Virtu Financial** · Austin, TX · 2d ago
- [Cloud Computing Engineer](https://job-boards.greenhouse.io/pdtpartners/jobs/8237144) — **PDT Partners** · New York, NY · 2d ago
- [Backend Engineer II - Data Platform](https://jobs.lever.co/spotify/186b763a-2a61-4563-8813-ff6b40c9c8a7) — **Spotify** · Stockholm · 3d ago
- [Applied AI Engineer](https://www.hudsonrivertrading.com/careers/job/?gh_jid=8234195) — **Hudson River Trading** · London, United Kingdom; New York, NY, United States; Singapore · 5d ago
- [GPU Performance Software Engineer](https://coreweave.com/careers/job?4703438006&board=coreweave&gh_jid=4703438006) — **CoreWeave** · New York, NY · 5d ago
- [Software Engineer – Query Engines](https://jobs.lever.co/palantir/4056c8f6-0e6a-43f7-b387-4a97bd3dbb19) — **Palantir** · London, United Kingdom  +1 more · 6d ago
- [Software Engineer Intern, Mobile (Winter 2027)](https://jobs.ashbyhq.com/notion/2b587e66-deac-421a-a824-9415ba78b5a7) — **Notion** · San Francisco, California · 6d ago
- [Security Engineer - Detection and Response](https://jobs.lever.co/spotify/cb29d857-395b-401d-9749-367e666ff870) — **Spotify** · New York, NY · 6d ago
- [Software Engineer, AI Teammates Platform](https://www.asana.com/jobs/apply/8078102?gh_jid=8078102) — **Asana** · San Francisco · 6d ago
- [Software Engineer, Systems & Platform Applied AI](https://jobs.ashbyhq.com/mercor/374cd009-516f-4a1f-abbf-bcca5287daae) — **Mercor** · San Francisco · 6d ago
- [Forward Deployed Software Engineer - US Government](https://jobs.lever.co/palantir/289ad049-7b4e-41e3-8a39-146fbeb6fb64) — **Palantir** · Washington, D.C.  +5 more · 6d ago
- [Software Engineer, Scheduled Tasks](https://job-boards.greenhouse.io/vercel/jobs/6207796004) — **Vercel** · Hybrid - San Francisco · 6d ago
- [Software Engineer, Model Capabilities](https://jobs.ashbyhq.com/notion/ab383335-1dd5-4d6a-971f-439cebf48a9d) — **Notion** · San Francisco, California · 7d ago
- [Security Systems Engineer](https://jobs.lever.co/palantir/8704b8c0-80b3-48b1-a82c-939994a0316c) — **Palantir** · Denver, CO  +3 more · 7d ago
- [Software Engineer, Robotics](https://jobs.ashbyhq.com/mercor/a217f1a6-c63c-4dfb-81c3-ecc0c5d44f98) — **Mercor** · San Francisco · 8d ago
- [Mercor AI Research Fund Grants](https://jobs.ashbyhq.com/mercor/e1f6792d-1aae-4c2e-8edb-e2b91343dbb5) — **Mercor** · San Francisco · 8d ago
- [2027 PhD Summer Associate, Machine Learning Research](https://careers.aqr.com/jobs?gh_jid=8224708&gh_jid=8224708) — **AQR** · Greenwich, CT · 8d ago
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
