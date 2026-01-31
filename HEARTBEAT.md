# HEARTBEAT.md

## Ongoing Work Check
- Check if there's active backlog work in progress (check last memory entry)
- If Drew asked me to continue working on something, resume it
- Track state in memory/heartbeat-state.json

## 🚨 TASK BOARD UPDATE RULE
**BEFORE starting ANY work:** Move task from backlog → in_progress
**AFTER completing work:** Move task to done, pull next from backlog
**Use:** `earl-helpers/move-task.sh "Task Title" <status> "description"`

## Dashboard Status Ping
- Ping https://earl-dashboard-sandy.vercel.app/api/earl/heartbeat on every heartbeat
- Use: `./earl-helpers/ping-status.sh "Current task description"`
- Keeps dashboard showing Active status in real-time

## Status
- Last check: (timestamp gets updated each run)
- Current task: (what I'm working on)
- Dashboard: https://earl-dashboard-sandy.vercel.app
