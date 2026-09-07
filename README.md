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
_1295 openings · updated 2026-09-07T13:09Z · [browse the live site »](https://lachlanspangler.github.io/job-finder/)_

- [Research Engineer, Cybersecurity](https://job-boards.greenhouse.io/anthropic/jobs/5412334008) — **Anthropic** · Zürich, CH · 4h ago
- [Software Engineer - Research Technology](https://job-boards.greenhouse.io/drweng/jobs/8176064) — **DRW** · Singapore · 4h ago
- [Software Engineer, Agent (New Grad 2027)](https://jobs.ashbyhq.com/sierra/149f368c-52d5-408f-ba26-ad888f318a00) — **Sierra** · San Francisco, CA  +1 more · 11h ago
- [Software Engineer, Intern](https://stripe.com/jobs/search?gh_jid=8031833) — **Stripe** · Bengaluru  +3 more · 7h ago
- [Applied AI Engineer, Codex | Tokyo](https://jobs.ashbyhq.com/openai/6668417f-6878-4244-940f-9a99ae4ebcb0) — **OpenAI** · Tokyo, Japan · 12h ago
- [Software Engineer, Host Assurance](https://jobs.ashbyhq.com/openai/0b9e565a-ae5f-40fc-8350-b59f71f76df1) — **OpenAI** · San Francisco · 1d ago
- [Infrastructure Engineer](https://jobs.ashbyhq.com/mercor/296c4031-5e98-4772-95f5-a9eb5bd7746d) — **Mercor** · San Francisco · 2d ago
- [Software Engineer, HSM Infrastructure Security, Consumer Devices](https://jobs.ashbyhq.com/openai/a14780e7-0316-478c-8e6a-d7629c31c49d) — **OpenAI** · San Francisco · 2d ago
- [Security Engineer, Application Security](https://jobs.ashbyhq.com/mercor/cf6fcf5a-6348-4d60-beb3-43333a2c2bb9) — **Mercor** · San Francisco · 2d ago
- [Cloud Platform Engineer (SF)](https://jobs.ashbyhq.com/mercor/9617d47a-9e6f-404f-b1fe-2fa4b7ff8471) — **Mercor** · San Francisco · 2d ago
- [Research Engineer, Audio and Speech](https://jobs.ashbyhq.com/decagon/69fd28a8-0de2-45a5-9b98-33725515add4) — **Decagon** · San Francisco · 2d ago
- [Research Engineer, Safety](https://jobs.ashbyhq.com/decagon/f84db19b-8de3-49d6-a954-c9ee2e365956) — **Decagon** · San Francisco · 2d ago
- [Applied AI Research Scientist](https://jobs.ashbyhq.com/sardine/44cf5225-547a-4584-a271-c0c6ddc7b0b6) — **Sardine** · North America · 2d ago
- [Software Engineer, Applied AI](https://jobs.ashbyhq.com/mercor/cae88190-a2fd-4d04-9352-9f48fedb56a7) — **Mercor** · San Francisco  +1 more · 2d ago
- [Software Engineer, Platform](https://jobs.ashbyhq.com/mercor/cb67851b-0269-4cf5-996c-34c3a88a19c8) — **Mercor** · San Francisco  +1 more · 2d ago
- [Compliance Associate, Trading Compliance](https://boards.greenhouse.io/point72/jobs/8784664002?gh_jid=8784664002) — **Point72/Cubist** · Stamford, CT · 2d ago
- [Data Center Security Engineer - WIDS](https://coreweave.com/careers/job?4711313006&board=coreweave&gh_jid=4711313006) — **CoreWeave** · Livingston, NJ · 2d ago
- [Recruiter, GTM & Field Engineering](https://databricks.com/company/careers/open-positions/job?gh_jid=8771700002) — **Databricks** · London, United Kingdom · 2d ago
- [Network Engineer](https://job-boards.eu.greenhouse.io/imc/jobs/4698599101) — **IMC Trading** · Hong Kong, Hong Kong  +2 more · 2d ago
- [Software Engineering Intern (Summer 2027)](https://job-boards.greenhouse.io/scaleai/jobs/4730845005) — **Scale AI** · San Francisco, CA · 2d ago
- [Software Engineer - New Grad](https://job-boards.greenhouse.io/scaleai/jobs/4730836005) — **Scale AI** · San Francisco, CA · 2d ago
- [Applied AI, Research Engineer](https://job-boards.greenhouse.io/anthropic/jobs/5390811008) — **Anthropic** · San Francisco, CA | New York City, NY · 2d ago
- [C++ Engineer - Experience](https://jobs.lever.co/spotify/29b0056f-f163-4728-a32a-214bcb3232e8) — **Spotify** · Stockholm · 3d ago
- [Field Engineer, Healthcare & SLED](https://jobs.ashbyhq.com/cursor/1cfacf1a-4ba7-4e68-9f65-4fb8e3525bde) — **Cursor** · Remote · 3d ago
- [Field Engineer, Public Sector](https://jobs.ashbyhq.com/cursor/a750c967-7c4d-4704-a528-dcb63afc5f64) — **Cursor** · Remote · 3d ago
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
