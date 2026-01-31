#!/bin/bash
# Quick status ping helper for Earl
# Usage: ./earl-helpers/ping-status.sh "Current task description"

# Load API key from config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/.earl-config"

if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE"
fi

if [ -z "$EARL_HEARTBEAT_KEY" ]; then
  echo "Error: EARL_HEARTBEAT_KEY not set in $CONFIG_FILE" >&2
  exit 1
fi

DASHBOARD_URL="https://earl-dashboard-sandy.vercel.app"
TASK="${1:-Working on backlog}"
MODEL="${2:-claude-sonnet-4-5}"

curl -s -X POST "$DASHBOARD_URL/api/earl/heartbeat" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $EARL_HEARTBEAT_KEY" \
  -d "{\"task\":\"$TASK\",\"model\":\"$MODEL\"}" > /dev/null 2>&1

# Exit silently (success or failure doesn't matter)
exit 0
