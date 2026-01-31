#!/bin/bash
# Git commit wrapper that auto-logs activity

MESSAGE="$1"

if [ -z "$MESSAGE" ]; then
  echo "Usage: ./git-commit-log.sh 'commit message'"
  exit 1
fi

# Do the commit
git add -A
git commit -m "$MESSAGE"
git push origin main

# Log the activity
/home/ubuntu/.openclaw/workspace/earl-helpers/log-activity.sh "git_commit" "Committed: $MESSAGE" "completed"

echo "✅ Committed and logged"
