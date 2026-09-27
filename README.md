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
_1360 openings · updated 2026-09-27T13:31Z · [browse the live site »](https://lachlanspangler.github.io/job-finder/)_

- [Software Engineer - Applied AI](https://www.hudsonrivertrading.com/careers/job/?gh_jid=8234195) — **Hudson River Trading** · London, United Kingdom; New York, NY, United States; Singapore · 1d ago
- [Wireless Regulatory Engineer - SAR](https://jobs.ashbyhq.com/openai/2250282b-7f1a-43e6-bf55-e603cbf0fd89) — **OpenAI** · Mountain View · 1d ago
- [Offensive Security Engineer](https://stripe.com/jobs/search?gh_jid=8233889) — **Stripe** · US - Remote · 1d ago
- [Quality Engineer](https://boards.greenhouse.io/robinhood/jobs/8187448?t=gh_src=&gh_jid=8187448) — **Robinhood** · Toronto, Canada · 1d ago
- [GPU Performance Software Engineer](https://coreweave.com/careers/job?4703438006&board=coreweave&gh_jid=4703438006) — **CoreWeave** · New York, NY · 1d ago
- [Software Engineer – Query Engines](https://jobs.lever.co/palantir/4056c8f6-0e6a-43f7-b387-4a97bd3dbb19) — **Palantir** · London, United Kingdom  +1 more · 2d ago
- [Verification Engineer](https://job-boards.eu.greenhouse.io/imc/jobs/4986491101) — **IMC Trading** · Chicago, United States · 2d ago
- [Trading Engineer](https://job-boards.eu.greenhouse.io/imc/jobs/4899716101) — **IMC Trading** · Aarhus, Central Denmark Region, Denmark  +1 more · 2d ago
- [Java Software Developer](https://job-boards.eu.greenhouse.io/imc/jobs/4986187101) — **IMC Trading** · Mumbai, India · 2d ago
- [Software Engineer, Search Infrastructure](https://jobs.ashbyhq.com/openai/7caed1e8-c6f6-4569-9d45-2d7a7a56a025) — **OpenAI** · San Francisco · 2d ago
- [Machine Learning Engineer, Core Experimentation](https://jobs.ashbyhq.com/openai/9d4d2727-27f3-4a63-857c-a96466130645) — **OpenAI** · Seattle · 2d ago
- [Software Engineer Intern, Mobile (Winter 2027)](https://jobs.ashbyhq.com/notion/2b587e66-deac-421a-a824-9415ba78b5a7) — **Notion** · San Francisco, California · 2d ago
- [Security Engineer - Detection and Response](https://jobs.lever.co/spotify/cb29d857-395b-401d-9749-367e666ff870) — **Spotify** · New York, NY · 2d ago
- [Software Engineer](https://www.asana.com/jobs/apply/7961475?gh_jid=7961475) — **Asana** · New York City  +1 more · 2d ago
- [Machine Learning Performance Engineer, Training](https://www.tower-research.com/open-positions/?gh_jid=8230413) — **Tower Research** · New York, NY · 2d ago
- [Forward Deployed Software Engineer - US Government](https://jobs.lever.co/palantir/289ad049-7b4e-41e3-8a39-146fbeb6fb64) — **Palantir** · Washington, D.C.  +5 more · 2d ago
- [Applied AI Engineer, Startups (Codex)](https://jobs.ashbyhq.com/openai/d801f26e-951e-452c-9924-9449b55edc5a) — **OpenAI** · Paris, France  +2 more · 2d ago
- [Software Engineer, Scheduled Tasks](https://job-boards.greenhouse.io/vercel/jobs/6207796004) — **Vercel** · Hybrid - San Francisco · 2d ago
- [Researcher - Rapid Research](https://boards.greenhouse.io/figma/jobs/6204360004?gh_jid=6204360004) — **Figma** · San Francisco, CA • New York, NY • United States · 2d ago
- [Trading Systems Reliability Engineer](https://www.tower-research.com/open-positions/?gh_jid=8129569) — **Tower Research** · Singapore · 3d ago
- [Software Engineering Intern, iOS](https://jobs.ashbyhq.com/ramp/b66be397-240b-41a6-9b05-493299b270a9) — **Ramp** · New York, NY (HQ) · 3d ago
- [Software Engineering Intern, Android](https://jobs.ashbyhq.com/ramp/fcf118cc-521a-4a62-9d13-945e5b6e3cb8) — **Ramp** · New York, NY (HQ) · 3d ago
- [Software Engineer Internship, Frontend](https://jobs.ashbyhq.com/ramp/a13ae586-f4cb-4385-8822-c42b9b54ed74) — **Ramp** · New York, NY (HQ) · 3d ago
- [Software Engineer, Model Capabilities](https://jobs.ashbyhq.com/notion/ab383335-1dd5-4d6a-971f-439cebf48a9d) — **Notion** · San Francisco, California · 3d ago
- [Security Systems Engineer](https://jobs.lever.co/palantir/8704b8c0-80b3-48b1-a82c-939994a0316c) — **Palantir** · Denver, CO  +3 more · 3d ago
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
