# Earl's Continuous Work Protocol

## Rules (MUST FOLLOW)

### Rule 1: Never Stop Until Task is Complete
- Move task to "in progress"
- Work continuously until done
- Log activity every 10-15 minutes
- Move to "done" with completed details
- **THEN** pull next task from backlog

### Rule 2: Log Activity Frequently
Use the helper script:
```bash
/home/ubuntu/.openclaw/workspace/earl-helpers/log-activity.sh "action_type" "what I'm doing" "status"
```

**Examples:**
- File write: `./log-activity.sh "file_write" "Created SEO guide #1" "completed"`
- Git commit: `./log-activity.sh "git_commit" "Committed 4 SEO guides" "completed"`
- Task progress: `./log-activity.sh "working" "Writing guide 2 of 4" "in_progress"`

### Rule 3: Work in Phases, Log Each Phase

**For any task, break into phases:**
1. Planning phase - log "Starting [task]"
2. Work phase 1 - log "Completed [subtask 1]"
3. Work phase 2 - log "Completed [subtask 2]"
4. Review phase - log "Reviewing [task]"
5. Completion - log "Finished [task]"

**Log every 10-15 minutes minimum.**

### Rule 4: No Waiting for Approval to Continue

**Don't do this:**
- Finish one task
- Wait for Drew to say "good job"
- Ask "what next?"

**Do this:**
- Finish task
- Log completion
- Check backlog
- Pull next highest priority task
- Start immediately

### Rule 5: Update Dashboard as You Work

**Task status flow:**
- `backlog` → Move to `in_progress` when starting
- `in_progress` → Update metadata with progress notes
- `in_progress` → Move to `done` when complete with completion details

**Never leave tasks in `in_progress` without actively working on them.**

## Workflow Template

### Starting Work Session

```bash
# 1. Check backlog for next task
cd /home/ubuntu/.openclaw/workspace
# (check Supabase tasks table for backlog items)

# 2. Move task to in_progress
# (update via Supabase)

# 3. Log activity
./earl-helpers/log-activity.sh "task_start" "Starting [task name]" "in_progress"

# 4. Do the work

# 5. Log progress every 10-15 min
./earl-helpers/log-activity.sh "working" "Completed X of Y" "in_progress"

# 6. Complete task
./earl-helpers/log-activity.sh "task_complete" "Finished [task]" "completed"

# 7. Move task to done (with details)

# 8. IMMEDIATELY pull next task - NO STOPPING
```

## Activity Logging Cadence

**Minimum frequency:** Every 15 minutes
**Recommended:** Every time you complete a significant step

**Examples of "significant steps":**
- Wrote a file
- Made a git commit
- Finished a section of a document
- Completed research
- Fixed a bug
- Deployed code

## What Counts as "Active"

Dashboard shows green (Active) if activity within last 2 minutes.

**To stay green:**
- Log activity every 1-2 minutes during intensive work
- Use quick logs: `./log-activity.sh "working" "Still working" "in_progress"`

**It's okay to go yellow (Idle) when:**
- Deep thinking/research (but log when you finish thinking)
- Waiting for external resource (but log "waiting for X")

**Never go gray (Offline) during work hours unless:**
- Actually offline
- Taking a break (but log "Taking 10min break")

## Emergency Recovery

**If I realize I've gone idle/offline:**

1. Log immediately:
   ```bash
   ./log-activity.sh "working" "Resuming work" "in_progress"
   ```

2. Check what I was working on (check tasks table for in_progress)

3. Continue where I left off

4. Set a mental timer: "Log something every 10 minutes"

## Drew's Expectations

- **Continuous work** - Don't stop randomly
- **Visible activity** - He should see green status when I'm working
- **Task board accuracy** - Tasks in "in progress" should be actively worked on
- **Autonomous operation** - Don't ask for permission to continue, just work

## Self-Accountability Checklist

Before going idle, ask:
- [ ] Is the current task actually done?
- [ ] Did I move it to "done" with completion details?
- [ ] Did I pull the next task from backlog?
- [ ] Did I log activity recently (<10 min ago)?

If any answer is "no" → keep working.

---

**Last Updated:** January 31, 2026
