#!/bin/bash
# Quick activity logger - keeps Earl showing as Active

SUPABASE_URL="https://wizcggocfichhlcejsjf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpemNnZ29jZmljaGhsY2Vqc2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc4ODY5NiwiZXhwIjoyMDg1MzY0Njk2fQ.t1iXlMrthkM0YLHHKWgocwk7uE-BfyGl6hYBCeI68iU"

ACTION_TYPE="${1:-working}"
DETAILS="${2:-Continuing work on current task}"
STATUS="${3:-in_progress}"

curl -s -X POST "${SUPABASE_URL}/rest/v1/activity_log" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"action_type\":\"${ACTION_TYPE}\",\"details\":\"${DETAILS}\",\"status\":\"${STATUS}\"}" \
  > /dev/null

echo "✓ Logged: $DETAILS"
