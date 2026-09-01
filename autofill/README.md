# Job Autofill (userscript)

A browser userscript that fills the application form **you're currently viewing**
on Greenhouse, Ashby, Lever, or Workday from a profile you store once. It:

- fills text fields, dropdowns, and Yes/No questions it can confidently match,
- outlines every field it touched in green and lists what it filled,
- **never submits the form, never solves CAPTCHAs, never uploads your resume.**

You review every field, attach your resume, and click submit yourself. This is
the same thing autofill extensions (Simplify, etc.) do — it stays on the right
side of these sites' terms because a human drives every submission.

## Install

1. Install a userscript manager: **Tampermonkey** (Chrome/Edge/Safari) or
   **Violentmonkey** (Firefox).
2. Open `autofill.user.js` → the manager will offer to install it. (Or: create a
   new script and paste the file's contents.)
3. Open the script and edit the `PROFILE = { ... }` block at the top with your
   real info. It lives only in your browser — nothing is uploaded, and the copy
   in this repo is placeholders.

## Use

1. Go to any job's application page (e.g. a `jobs.ashbyhq.com/...` or
   `boards.greenhouse.io/...` apply form).
2. Click **⚡ Job Autofill → Fill this form** (bottom-right).
3. Check the green-outlined fields and the "filled" list, fix anything wrong,
   fill anything it missed, attach your resume, and submit.

## What it fills

Contact (name, email, phone, city), links (LinkedIn, GitHub, website), education
(school, degree, major, grad year), salary expectation, "how did you hear",
work-authorization / sponsorship Yes-No questions, and optional EEO fields (only
if you set them). Anything ambiguous or free-text ("Why us?") is left for you —
by design.

## Notes

- Field matching is heuristic; odd labels won't match. That's why you review.
- Custom screening questions and cover letters are intentionally **not**
  auto-answered — those need to be genuine and specific.
- It won't overwrite a field you've already typed into.
