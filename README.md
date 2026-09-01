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
_1282 openings · updated 2026-09-01T19:56Z · [browse the live site »](https://lachlanspangler.github.io/job-finder/)_

- [Systems Test Engineer, End-to-End Validation | Consumer Devices](https://jobs.ashbyhq.com/openai/393b88d7-1fbc-466a-9108-a7c1bafeb8d8) — **OpenAI** · San Francisco · 3h ago
- [AI Acceleration Engineer](https://jobs.ashbyhq.com/decagon/c68de30e-1293-48bd-8f8e-dbbbb7d204b9) — **Decagon** · San Francisco · 4h ago
- [Derived Data Engineer](https://www.jumptrading.com/hr/job?gh_jid=8171513) — **Jump Trading** · Chicago or New York · 1h ago
- [Data Engineer](https://www.jumptrading.com/hr/job?gh_jid=8171060) — **Jump Trading** · New York or Chicago · 2h ago
- [Quantitative Trader/Researcher Summer Internship 2027 (2028 Graduates)](https://www.tower-research.com/open-positions/?gh_jid=8037860) — **Tower Research** · London · 4h ago
- [Quantitative Trader/Researcher Graduate Programme 2027](https://www.tower-research.com/open-positions/?gh_jid=8037824) — **Tower Research** · London · 4h ago
- [AI Engineer - FDE (Forward Deployed Engineer)](https://databricks.com/company/careers/open-positions/job?gh_jid=8760281002) — **Databricks** · Berkeley, California; Los Angeles, California; Mountain View, California; Sacramento, California; San Diego, California; San Francisco, California  +14 more · 5h ago
- [Data Quality Engineer](https://job-boards.eu.greenhouse.io/imc/jobs/4879217101) — **IMC Trading** · Amsterdam, Netherlands · 6h ago
- [Quantitative Researcher Intern, Bachelor or Master](https://www.tower-research.com/open-positions/?gh_jid=8168750) — **Tower Research** · Singapore, Hong Kong, Shanghai, Sydney · 15h ago
- [Quantitative Researcher Intern, PhD or Postdoc](https://www.tower-research.com/open-positions/?gh_jid=8168634) — **Tower Research** · Singapore, Hong Kong, Shanghai, Sydney · 16h ago
- [Software Engineer](https://www.janestreet.com/join-jane-street/apply/8419303002?gh_jid=8419303002) — **Jane Street** · New York, New York, United States  +3 more · 16h ago
- [Software Engineer, Integrity Foundations - London](https://jobs.ashbyhq.com/openai/46703db4-6023-4ac6-93a8-22dc95009945) — **OpenAI** · London, UK · 21h ago
- [Software Engineer, ML Platform](https://jobs.ashbyhq.com/cursor/167f0e93-6915-4d56-803a-be89d1441fb5) — **Cursor** · San Francisco · 23h ago
- [Software Engineer, Safety Engineering](https://jobs.ashbyhq.com/openai/9371f837-70ef-4387-a4b7-70f252b04aa5) — **OpenAI** · San Francisco · 1d ago
- [Software Engineer, Intern (Summer or Winter)](https://stripe.com/jobs/search?gh_jid=8097801) — **Stripe** · Dublin  +2 more · 20h ago
- [Software Engineer, New Grad](https://stripe.com/jobs/search?gh_jid=8130881) — **Stripe** · Dublin  +4 more · 20h ago
- [Software Engineer, Intern](https://stripe.com/jobs/search?gh_jid=8031833) — **Stripe** · Bengaluru  +2 more · 21h ago
- [Software Engineer, New Grad - Frontend](https://stripe.com/jobs/search?gh_jid=8130927) — **Stripe** · Barcelona · 21h ago
- [Software Engineer, Agent (New Grad 2027)](https://jobs.ashbyhq.com/sierra/149f368c-52d5-408f-ba26-ad888f318a00) — **Sierra** · San Francisco, CA · 1d ago
- [Systems Integration Engineer, Build Systems | Consumer Devices](https://jobs.ashbyhq.com/openai/9104a37c-6ae0-499b-a2f7-2785e63b5f0c) — **OpenAI** · San Francisco · 1d ago
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
