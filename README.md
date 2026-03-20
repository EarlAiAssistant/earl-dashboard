# Earl Dashboard — Task Management System

A fast, keyboard-first task management dashboard inspired by Linear. Built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Drizzle ORM.

## Features (Phase 1)

- **List View** — Sortable, filterable task table with search
- **Kanban Board** — Drag-and-drop between 5 status columns (Triage → Backlog → In Progress → In Review → Done)
- **Task Detail Panel** — Inline editing, activity log, metadata
- **Full CRUD API** — RESTful endpoints with pagination, filtering, sorting
- **Activity Tracking** — Automatic audit log for all task changes
- **Dark Mode** — Default dark theme with CSS variable system
- **Optimistic UI** — React Query for fast, responsive interactions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript + Tailwind CSS |
| Database | SQLite (via better-sqlite3) — swap to PostgreSQL for production |
| ORM | Drizzle ORM |
| State | React Query (TanStack Query v5) |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Open http://localhost:3000/dashboard
```

The SQLite database is auto-created in `data/earl-dashboard.db` on first request.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List tasks (supports `?status=`, `?priority=`, `?sortBy=`, `?sortOrder=`, `?search=`, `?page=`, `?pageSize=`) |
| `POST` | `/api/tasks` | Create task (`{ title, description?, status?, priority? }`) |
| `GET` | `/api/tasks/:id` | Get task with activity log |
| `PATCH` | `/api/tasks/:id` | Update task fields |
| `DELETE` | `/api/tasks/:id` | Delete task |

## Project Structure

```
src/
├── app/
│   ├── api/tasks/          # REST API routes
│   ├── dashboard/          # Main dashboard page
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Redirect to /dashboard
│   └── providers.tsx       # React Query provider
├── components/
│   ├── ui/                 # Reusable UI primitives (Button, Badge, Input, Select, Textarea)
│   ├── create-task-dialog.tsx
│   ├── kanban-board.tsx    # Drag-and-drop board view
│   ├── task-detail-panel.tsx
│   └── task-list.tsx       # Filterable list view
├── lib/
│   ├── db/
│   │   ├── index.ts        # Database connection + auto-migration
│   │   └── schema.ts       # Drizzle ORM schema
│   ├── hooks/
│   │   └── use-tasks.ts    # React Query hooks for CRUD
│   ├── types.ts            # TypeScript types and constants
│   └── utils.ts            # Utility functions
└── styles/
    └── globals.css         # Tailwind + CSS variables
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_PATH` | `./data/earl-dashboard.db` | Path to SQLite database file |

## Next Steps (Phase 2)

- [ ] Command palette (Cmd+K) with cmdk
- [ ] Keyboard shortcuts (C = create, S = set status)
- [ ] Supabase/PostgreSQL for production database
- [ ] Authentication
- [ ] Real-time updates
- [ ] Task labels/tags
- [ ] Bulk operations
