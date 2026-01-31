#!/bin/bash
# Create a new task in the Kanban board
# Usage: ./create-task.sh "Task Title" "backlog|in_progress|done" "Optional description"

SUPABASE_URL="https://wizcggocfichhlcejsjf.supabase.co"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpemNnZ29jZmljaGhsY2Vqc2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc4ODY5NiwiZXhwIjoyMDg1MzY0Njk2fQ.t1iXlMrthkM0YLHHKWgocwk7uE-BfyGl6hYBCeI68iU"

TITLE="$1"
STATUS="${2:-backlog}"
DESCRIPTION="${3:-}"

if [ -z "$TITLE" ]; then
  echo "Usage: ./create-task.sh \"Task Title\" [status] [description]"
  echo "Status: backlog (default), in_progress, done"
  exit 1
fi

# Escape quotes in title and description
ESCAPED_TITLE=$(echo "$TITLE" | sed 's/"/\\"/g')
ESCAPED_DESC=$(echo "$DESCRIPTION" | sed 's/"/\\"/g')

# Build payload
PAYLOAD="{\"title\":\"$ESCAPED_TITLE\",\"status\":\"$STATUS\""

if [ -n "$DESCRIPTION" ]; then
  PAYLOAD+=",\"description\":\"$ESCAPED_DESC\""
fi

PAYLOAD+="}"

# Create the task
RESULT=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/tasks" \
  -H "apikey: ${API_KEY}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$PAYLOAD")

if echo "$RESULT" | grep -q '"id"'; then
  echo "✓ Created task: $TITLE (status: $STATUS)"
else
  echo "✗ Failed to create task: $RESULT"
fi
