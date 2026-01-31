#!/bin/bash
# Quick status ping helper for Earl
# Usage: ./earl-helpers/ping-status.sh "Current task description"

DASHBOARD_URL="https://earl-dashboard-sandy.vercel.app"
TASK="${1:-Working on backlog}"
MODEL="${2:-claude-sonnet-4-5}"

curl -s -X POST "$DASHBOARD_URL/api/earl/heartbeat" \
  -H "Content-Type: application/json" \
  -d "{\"task\":\"$TASK\",\"model\":\"$MODEL\"}" > /dev/null 2>&1

# Exit silently (success or failure doesn't matter)
exit 0
