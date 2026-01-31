#!/bin/bash
# Continuous work loop that logs activity every 2 minutes

TASK_NAME="$1"

if [ -z "$TASK_NAME" ]; then
  echo "Usage: ./work-loop.sh 'Task name'"
  exit 1
fi

echo "🚀 Starting work loop for: $TASK_NAME"
echo "Will log activity every 2 minutes automatically"

# Log start
/home/ubuntu/.openclaw/workspace/earl-helpers/log-activity.sh "working" "Working on: $TASK_NAME" "in_progress"

# Background loop that logs every 2 minutes
(
  while true; do
    sleep 120  # 2 minutes
    /home/ubuntu/.openclaw/workspace/earl-helpers/log-activity.sh "working" "Still working on: $TASK_NAME" "in_progress"
  done
) &

# Save PID so we can kill it later
LOOP_PID=$!
echo $LOOP_PID > /tmp/earl-work-loop.pid

echo "✓ Activity logging loop started (PID: $LOOP_PID)"
echo "Run 'kill \$(cat /tmp/earl-work-loop.pid)' to stop when done"
