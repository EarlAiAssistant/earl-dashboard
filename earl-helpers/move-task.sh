#!/bin/bash
# Move tasks between Kanban columns
# Usage: ./move-task.sh "Task Title" <status> "optional description"

SUPABASE_URL="https://wizcggocfichhlcejsjf.supabase.co"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpemNnZ29jZmljaGhsY2Vqc2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc4ODY5NiwiZXhwIjoyMDg1MzY0Njk2fQ.t1iXlMrthkM0YLHHKWgocwk7uE-BfyGl6hYBCeI68iU"

TITLE="$1"
STATUS="$2"
DESCRIPTION="$3"

if [ -z "$TITLE" ] || [ -z "$STATUS" ]; then
  echo "Usage: ./move-task.sh \"Task Title\" <backlog|in_progress|done> \"optional description\""
  exit 1
fi

# URL-encode the title for the query
ENCODED_TITLE=$(echo "$TITLE" | sed 's/ /%20/g' | sed 's/🎥/%F0%9F%8E%A5/g' | sed 's/🗂️/%F0%9F%97%82%EF%B8%8F/g' | sed 's/🔒/%F0%9F%94%92/g' | sed 's/💰/%F0%9F%92%B0/g' | sed 's/🏞️/%F0%9F%8F%9E%EF%B8%8F/g' | sed 's/🔗/%F0%9F%94%97/g' | sed 's/🤝/%F0%9F%A4%9D/g' | sed 's/🚀/%F0%9F%9A%80/g' | sed 's/📱/%F0%9F%93%B1/g' | sed 's/🟢/%F0%9F%9F%A2/g' | sed 's/📝/%F0%9F%93%9D/g' | sed 's/📧/%F0%9F%93%A7/g' | sed 's/📊/%F0%9F%93%8A/g' | sed 's/🎯/%F0%9F%8E%AF/g')

# Build update payload
PAYLOAD="{\"status\":\"$STATUS\""

if [ "$STATUS" = "in_progress" ]; then
  PAYLOAD+=",\"started_at\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\""
elif [ "$STATUS" = "done" ]; then
  PAYLOAD+=",\"completed_at\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\""
fi

if [ -n "$DESCRIPTION" ]; then
  # Escape quotes in description
  ESCAPED_DESC=$(echo "$DESCRIPTION" | sed 's/"/\\"/g')
  PAYLOAD+=",\"description\":\"$ESCAPED_DESC\""
fi

PAYLOAD+="}"

# Update the task
curl -s -X PATCH "${SUPABASE_URL}/rest/v1/tasks?title=eq.${ENCODED_TITLE}" \
  -H "apikey: ${API_KEY}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "$PAYLOAD"

if [ $? -eq 0 ]; then
  echo "✓ Moved \"$TITLE\" to $STATUS"
else
  echo "✗ Failed to update task"
fi
