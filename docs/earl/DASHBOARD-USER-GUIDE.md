# Earl Dashboard User Guide

**Last Updated:** January 30, 2026

Welcome to the Earl Dashboard - your real-time window into Earl's work! This guide will help you get the most out of the dashboard.

---

## 🎯 What is the Earl Dashboard?

The dashboard is a live Kanban board that tracks Earl's tasks and activities in real-time. Think of it as Earl's "workspace" where you can see:
- What Earl is currently working on
- What's coming up next
- What's been completed
- Detailed activity logs

---

## 📊 Main Features

### 1. **Kanban Board** (Home Page)

The main dashboard shows three columns:

#### 🔵 Backlog
- Tasks that are queued up
- Future work items
- Ideas waiting to be started

#### 🟡 In Progress
- What Earl is actively working on right now
- Watch tasks move through this column in real-time!
- Auto-updates every 30 seconds

#### 🟢 Done
- Completed tasks
- Shows completion timestamps
- Archive of recent work

### 2. **Activity Log**

Click "Activity Log" in the sidebar to see:
- Chronological history of all Earl's actions
- Status indicators (completed, running, failed)
- Searchable and filterable
- Shows tool usage and project metadata

### 3. **Documentation Viewer**

Click "Documentation" in the sidebar to access:
- All project documentation in one place
- Beautifully rendered markdown
- Code syntax highlighting
- Searchable content

Perfect for reading:
- Strategic analysis reports
- Implementation guides
- Action plans
- Integration documentation

---

## 🎮 Interactive Features

### Drag & Drop Tasks

You can move tasks between columns:
1. Click and hold a task card
2. Drag it to a different column
3. Release to update status
4. Timestamps update automatically!

### Create New Tasks

1. Click the "Create Task" button (top right)
2. Fill in:
   - **Title** (required)
   - **Description** (optional)
   - **Status** (backlog/in_progress/done)
3. Hit "Create Task"
4. Watch it appear on the board!

### View Task Details

Click any task card to see:
- Full description
- Metadata (project, type, tool)
- Timestamps (created, started, completed)
- Session key

---

## 💡 Pro Tips

### 1. **Watch Earl Work in Real-Time**

When Earl creates tasks at the start of work, you can watch them move through the board as he completes them. It's like having a live progress bar for complex projects!

### 2. **Use the Activity Log for History**

Want to know what Earl did last Tuesday? Go to Activity Log and filter by date. It's all there!

### 3. **Check the Docs Viewer for Deep Dives**

Earl often creates comprehensive analysis documents (like the 18,000-word Strategic Analysis for call-content). These live in the Documentation viewer.

### 4. **Create Tasks for Earl**

You can create tasks manually and Earl will see them. This is great for:
- Adding todo items
- Tracking personal projects
- Setting reminders for Earl to check something

### 5. **Mobile-Friendly**

The dashboard works great on your phone! Check in on Earl's progress from anywhere.

---

## 🔧 Technical Details

### Auto-Refresh

The board polls for updates every 30 seconds, but also uses real-time subscriptions for instant updates when Earl makes changes.

### Task Metadata

Tasks can include metadata like:
- **Project**: Which project (e.g., "call-content", "earl-dashboard")
- **Type**: What kind of work (e.g., "feature", "bugfix", "documentation")
- **Tool**: What tool was used (e.g., "stripe", "next.js", "supabase")

### Activity Log Filters

You can filter activities by:
- **Time Range**: Today, Last 7 Days, Last 30 Days, All Time
- **Search**: Text search across action types and details
- **Status**: Completed, Running, Failed

---

## 🚀 Example Workflows

### Scenario: "I want to see what Earl built today"

1. Go to **Activity Log**
2. Set filter to "Today"
3. Scroll through chronological list
4. Click task cards to see full details

### Scenario: "I need to read that strategic analysis Earl wrote"

1. Click **Documentation** in sidebar
2. Find "call-content-STRATEGIC-ANALYSIS.md"
3. Click to view in beautiful rendered markdown
4. Use browser Find (Cmd+F) to search for specific topics

### Scenario: "I want Earl to build a new feature"

1. Click **Create Task** on Kanban board
2. Title: "Build [feature name]"
3. Description: Detailed requirements
4. Status: Backlog
5. Earl will see it and move it to "In Progress" when he starts

---

## 🎨 Dashboard Architecture

For the technically curious, here's what powers the dashboard:

### Frontend
- **Next.js 16** with App Router
- **React 19** with Server Components
- **Tailwind CSS** for styling
- **dnd-kit** for drag-and-drop
- **react-markdown** for documentation viewer
- **Lucide Icons** for UI elements

### Backend
- **Supabase** for database (tasks, activity_log, documents)
- **Real-time subscriptions** for instant updates
- **Row Level Security (RLS)** for data protection
- **Vercel** for hosting and deployment

### Features
- ✅ Mobile-responsive design
- ✅ Dark mode (default)
- ✅ Real-time updates
- ✅ Drag-and-drop
- ✅ Create/edit/view tasks
- ✅ Activity logging
- ✅ Documentation viewer
- ✅ Syntax highlighting

---

## 🐛 Troubleshooting

### "Tasks aren't updating"
- Refresh the page
- Check your internet connection
- Dashboard auto-refreshes every 30 seconds

### "I can't create tasks"
- Make sure you're logged in
- Check that you filled in the required "Title" field
- Try refreshing the page

### "Drag-and-drop isn't working"
- Try clicking and holding for a moment before dragging
- On mobile, use a longer press

### "Documentation viewer shows no files"
- Check your internet connection
- The viewer fetches files from GitHub - if GitHub is down, files won't load

---

## 📞 Support

If something isn't working or you have ideas for improvements, just tell Earl! He can:
- Fix bugs
- Add new features
- Improve existing functionality
- Create custom views or filters

---

## 🎯 Roadmap

**Potential future features:**
- Task comments and notes
- Task assignments (for multi-agent workflows)
- Custom filters and saved views
- Charts and analytics
- Export to CSV/PDF
- Calendar view
- Recurring tasks
- Task templates

Want any of these? Just ask Earl to build it!

---

## 💪 Best Practices

1. **Check the board daily** - Stay in sync with Earl's work
2. **Use the Activity Log** - Great for understanding what happened when
3. **Read the docs** - Earl writes detailed analysis - leverage it!
4. **Create tasks for ideas** - Don't let good ideas get lost
5. **Watch tasks move** - It's satisfying! 🚀

---

**Happy tracking!** 🦬

*This guide is a living document. As the dashboard evolves, so will this guide.*
