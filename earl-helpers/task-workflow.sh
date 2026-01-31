#!/bin/bash
# Complete task workflow with automatic activity logging

SUPABASE_URL="https://wizcggocfichhlcejsjf.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpemNnZ29jZmljaGhsY2Vqc2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc4ODY5NiwiZXhwIjoyMDg1MzY0Njk2fQ.t1iXlMrthkM0YLHHKWgocwk7uE-BfyGl6hYBCeI68iU"

# Function: Start task (moves to in_progress)
start_task() {
  local task_title="$1"
  echo "Starting task: $task_title"
  
  # Log activity
  /home/ubuntu/.openclaw/workspace/earl-helpers/log-activity.sh "task_start" "Started: $task_title" "in_progress"
  
  # Start work loop
  /home/ubuntu/.openclaw/workspace/earl-helpers/work-loop.sh "$task_title" &
}

# Function: Log progress
log_progress() {
  local message="$1"
  /home/ubuntu/.openclaw/workspace/earl-helpers/log-activity.sh "working" "$message" "in_progress"
}

# Function: Complete task (moves to done)
complete_task() {
  local message="$1"
  
  # Kill work loop
  if [ -f /tmp/earl-work-loop.pid ]; then
    kill $(cat /tmp/earl-work-loop.pid) 2>/dev/null
    rm /tmp/earl-work-loop.pid
  fi
  
  # Log completion
  /home/ubuntu/.openclaw/workspace/earl-helpers/log-activity.sh "task_complete" "Completed: $message" "completed"
  
  echo "✅ Task complete: $message"
}

# Export functions
export -f start_task
export -f log_progress
export -f complete_task

echo "Earl task workflow helpers loaded"
echo "Usage:"
echo "  start_task 'Task name'"
echo "  log_progress 'What I just did'"
echo "  complete_task 'Final summary'"
