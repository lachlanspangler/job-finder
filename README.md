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

## Recent openings

<!-- JOBS:START -->
_1653 openings · updated 2026-09-01T18:47Z · [browse the live site »](https://lachlanspangler.github.io/job-finder/)_

- [Systems Test Engineer, End-to-End Validation | Consumer Devices](https://jobs.ashbyhq.com/openai/393b88d7-1fbc-466a-9108-a7c1bafeb8d8) — **OpenAI** · San Francisco · 1h ago
- [Derived Data Engineer](https://www.jumptrading.com/hr/job?gh_jid=8171513) — **Jump Trading** · Chicago or New York · 0m ago
- [Customer Experience Associate, Core Services Resolutions Desk](https://boards.greenhouse.io/robinhood/jobs/8130471?t=gh_src=&gh_jid=8130471) — **Robinhood** · Denver, CO; Westlake, TX · 1h ago
- [Core Data Engineer](https://www.jumptrading.com/hr/job?gh_jid=8171060) — **Jump Trading** · New York or Chicago · 1h ago
- [Margin Specialist](https://boards.greenhouse.io/robinhood/jobs/8171008?t=gh_src=&gh_jid=8171008) — **Robinhood** · Chicago, IL; Denver, CO; Lake Mary, FL; New York, NY · 1h ago
- [Analyst, Privacy](https://www.coinbase.com/careers/positions/8168175?gh_jid=8168175) — **Coinbase** · Remote - USA · 2h ago
- [Quantitative Trader/Researcher Summer Internship 2027 (2028 Graduates)](https://www.tower-research.com/open-positions/?gh_jid=8037860) — **Tower Research** · London · 3h ago
- [Quantitative Trader/Researcher Graduate Programme 2027](https://www.tower-research.com/open-positions/?gh_jid=8037824) — **Tower Research** · London · 3h ago
- [Sales Strategy & Operations Analyst](https://stripe.com/jobs/search?gh_jid=8164674) — **Stripe** · US · 3h ago
- [Back Office Operations Senior Associate](https://boards.greenhouse.io/point72/jobs/8760806002?gh_jid=8760806002) — **Point72/Cubist** · Bengaluru, India · 3h ago
- [AI Engineer - FDE (Forward Deployed Engineer)](https://databricks.com/company/careers/open-positions/job?gh_jid=8760289002) — **Databricks** · New York City, New York  +14 more · 4h ago
- [Data Quality Engineer](https://job-boards.eu.greenhouse.io/imc/jobs/4879217101) — **IMC Trading** · Amsterdam, Netherlands · 5h ago
- [Technical Support Engineer (EMEA)](https://stripe.com/jobs/search?gh_jid=7737248) — **Stripe** · London · 6h ago
- [Account Associate- EMEA (French Speaking)](https://jobs.ashbyhq.com/openai/1eb6ef0f-0e51-46d3-b888-c1a4c22c190a) — **OpenAI** · Dublin, Ireland · 10h ago
- [Account Associate - EMEA (German Speaking)](https://jobs.ashbyhq.com/openai/6c88bfaa-7f1b-4175-82f1-6d484a516ca8) — **OpenAI** · Dublin, Ireland · 10h ago
- [Intern, Agent Development (Winter 2027)](https://jobs.ashbyhq.com/sierra/02e1c456-8489-4a74-9fe7-af8845b040e4) — **Sierra** · San Francisco, CA · 17h ago
- [Operations Associate, Apprenticeship](https://stripe.com/jobs/search?gh_jid=8131339) — **Stripe** · Bengaluru · 13h ago
- [Quantitative Researcher Intern, Bachelor or Master](https://www.tower-research.com/open-positions/?gh_jid=8168750) — **Tower Research** · Singapore, Hong Kong, Shanghai, Sydney · 14h ago
- [Quantitative Researcher Intern, PhD or Postdoc](https://www.tower-research.com/open-positions/?gh_jid=8168634) — **Tower Research** · Singapore, Hong Kong, Shanghai, Sydney · 14h ago
- [APX (New Grad 2027)](https://jobs.ashbyhq.com/sierra/d9c445da-c7b4-43a3-8d71-d367681c3015) — **Sierra** · San Francisco, CA · 20h ago
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
