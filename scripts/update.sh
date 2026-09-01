#!/usr/bin/env bash
#
# Daily update: refresh the job data + README section and publish.
# Real content (job listings genuinely change day to day), so the daily commit
# is a truthful data update, not filler.

set -uo pipefail
REPO="/Users/spanglew/job-finder"
cd "$REPO" || { echo "repo not found: $REPO"; exit 1; }

/usr/bin/python3 jobfinder.py --export --top 25 --notify

if [ -n "$(git status --porcelain docs/jobs.json README.md)" ]; then
  git add docs/jobs.json README.md
  git commit -q -m "Update job listings ($(date '+%Y-%m-%d'))"
  git push -q origin main || echo "push failed — run 'git push' manually (launchd may lack cached credentials)"
else
  echo "no listing changes today"
fi
