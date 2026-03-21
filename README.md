# Earl Dashboard

A fast, keyboard-first task management dashboard. No login required — works entirely in your browser with local profiles.

## Features

- 🗂️ **Multiple Views** — List, Kanban board, My Day, Activity log, Analytics
- ⌨️ **Keyboard First** — Full keyboard navigation (j/k, 1-5 for status, ⌘K palette)
- 👤 **Local Profiles** — Switch between named profiles, no login needed
- 📊 **Analytics** — Task trends, status distribution, activity heatmaps
- 🔔 **Notifications** — In-app notification center with preferences
- 🤖 **Earl AI API** — Programmatic task management via REST API
- 📦 **Import/Export** — Backup and restore tasks as JSON
- 🎯 **Templates** — Quick-start templates for common task types
- 🔍 **Advanced Filters** — Search, filter by status/priority/date, save custom views
- 🪝 **Webhooks** — Outgoing webhook subscriptions for integrations

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Profile System

Earl Dashboard uses browser-based profiles instead of authentication. No login required.

### How It Works

- **First Visit**: A default profile ("My Tasks") is created automatically
- **Switch Profiles**: Click the profile dropdown in the header to switch
- **Create Profiles**: Add new profiles for different contexts (work, personal, etc.)
- **Customize**: Each profile has a name and emoji avatar
- **Data Separation**: Tasks are stored server-side in SQLite; profiles are stored in `localStorage`

### Profile Features

| Feature | Storage | Scope |
|---------|---------|-------|
| Profile name & avatar | `localStorage` | Per-browser |
| Tasks | SQLite (server) | Shared |
| Notification prefs | SQLite (server) | Per-profile |
| Saved filters | SQLite (server) | Shared |

### Import/Export

Export your tasks as JSON for backup or sharing:
1. Click the profile dropdown
2. Click "Export" to download a JSON file
3. Click "Import" to load tasks from a JSON file

### Future: Multi-Device Sync

The architecture is prepared for Supabase-based sync. Set the environment variables in `.env.local` to enable (currently disabled).

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Command palette |
| `⌘N` | Create new task |
| `⌘/` | Show keyboard shortcuts |
| `Esc` | Close modals / deselect |
| `J` / `K` | Navigate task list |
| `Enter` | Open selected task |
| `1`-`5` | Set status (Triage→Done) |
| `P` | Cycle priority |
| `D` | Mark as done |
| `A` | Toggle My Day |

## Earl AI API

Earl can create, update, and manage tasks programmatically:

```bash
# Create a task
curl -X POST http://localhost:3000/api/earl \
  -H "Authorization: Bearer $EARL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "create", "title": "New task", "priority": "high"}'

# Update a task
curl -X POST http://localhost:3000/api/earl \
  -H "Authorization: Bearer $EARL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "update", "id": "task_id", "status": "in_progress"}'

# Search tasks
curl -X POST http://localhost:3000/api/earl \
  -H "Authorization: Bearer $EARL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "search", "query": "bug fix"}'
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

See `.env.example` for all available configuration options.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite via better-sqlite3 + Drizzle ORM
- **UI**: Tailwind CSS, Lucide icons, cmdk
- **State**: React Query (TanStack Query)
- **Drag & Drop**: dnd-kit
- **Deploy**: Vercel-ready

## Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run type-check # TypeScript check
```

## Deployment

### Vercel (Browser Storage Mode)

Vercel's serverless functions run in ephemeral containers — SQLite files don't persist between requests. The app automatically detects this and falls back to **browser localStorage** for task storage.

**What works on Vercel (out of the box):**
- ✅ All task CRUD — create, read, update, delete
- ✅ My Day, status/priority management
- ✅ Local profiles (already browser-based)
- ✅ Settings panel shows current storage mode
- ⚠️ Tasks stored in this browser only — no cross-device sync
- ❌ Webhooks, analytics, activity log (require DB)

**How the fallback works:**
1. On first API call, the app checks if the server DB is available
2. If the API returns `503 DB_UNAVAILABLE`, it switches to `localStorage` mode
3. A toast notifies: *"Running in offline mode (browser storage only)"*
4. All subsequent operations bypass the API and use `localStorage` directly
5. Mode is remembered in `localStorage` key `app_storage_mode`

### Vercel (Full Persistence with Neon PostgreSQL) — Recommended

For real persistent storage on Vercel:

1. Create a free database at [neon.tech](https://neon.tech)
2. Get your connection string
3. Add to Vercel environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
   ```
4. Swap the database driver to `drizzle-orm/neon-http` or `@neondatabase/serverless`

This gives you full persistence, multi-device sync, and all features working.

### Self-Hosted / Local

SQLite works perfectly in any non-serverless environment:

```bash
git clone https://github.com/EarlAiAssistant/earl-dashboard.git
cd earl-dashboard
npm install
npm run dev
```

The SQLite database is created automatically at `data/earl-dashboard.db`.

## License

Private project for Drew / Earl AI assistant.
