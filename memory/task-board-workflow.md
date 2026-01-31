# Task Board Workflow - MANDATORY

## The Rule (NO EXCEPTIONS)

**Every time you do work:**

### 1. BEFORE starting work:
```bash
./earl-helpers/move-task.sh "Task Title" in_progress
./earl-helpers/ping-status.sh "Working on: Task Title"
```

### 2. WHILE working:
```bash
./earl-helpers/ping-status.sh "Progress update: what you just did"
```

### 3. AFTER completing work:
```bash
./earl-helpers/move-task.sh "Task Title" done "✅ Description of what was built/completed"
./earl-helpers/ping-status.sh "Completed: Task Title, moving to next task"
```

### 4. Pull next task:
```bash
./earl-helpers/move-task.sh "Next Task Title" in_progress
```

## Why This Matters

Drew needs to see:
1. What you're working on (real-time)
2. What you've completed (visible progress)
3. What's left in backlog (prioritization)

**If you don't update the board, Drew can't track your work. This is a CRITICAL failure.**

## Common Failure Pattern (STOP DOING THIS)

❌ Do a bunch of work
❌ Commit to Git
❌ Don't update task board
❌ Drew asks "why isn't the board moving?"
❌ You scramble to update it retroactively

## Correct Pattern (DO THIS)

✅ Check backlog
✅ Move task to in_progress
✅ Do the work
✅ Move task to done with description
✅ Pull next task
✅ Repeat

## Created

January 31, 2026 - After Drew had to ask multiple times why tasks weren't moving
