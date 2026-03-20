# Earl Dashboard

A modern project management and task tracking dashboard for managing work, documenting decisions, and tracking progress.

## Overview

Earl Dashboard is a Jira-like task management system built with:
- **Frontend:** Next.js + React + TypeScript + Tailwind CSS
- **Backend:** Drizzle ORM + PostgreSQL
- **UI Components:** shadcn/ui
- **Deployment:** Vercel

## Features

- **List & Kanban Views** — Switch between list and board layouts
- **Task Management** — Create, update, categorize, and prioritize tasks
- **Status Tracking** — Triage → Backlog → In Progress → In Review → Done
- **Priority Levels** — Urgent, High, Medium, Low
- **Keyboard Navigation** — `Cmd+K` command palette, single-letter shortcuts
- **Activity Logging** — Track all task updates and actions
- **API** — Simple REST API with bearer token auth for programmatic access
- **Documents Section** — Organized documentation and decision logs

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon)
- Vercel account (for deployment)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and API credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
src/
├── app/          # Next.js app router pages and API routes
├── components/   # React components (shared and page-specific)
├── lib/          # Utilities, database setup, helpers
└── styles/       # Global CSS and Tailwind configuration

public/          # Static assets
docs/            # Project documentation
```

## Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design and database schema
- **[API.md](docs/API.md)** — REST API documentation
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Development workflow and conventions
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Deployment and environment setup

## Build Phases

### Phase 1 (Week 1)
- [ ] List view (tasks, filtering, sorting)
- [ ] Kanban board view (drag-and-drop)
- [ ] Task CRUD operations
- [ ] Basic API

### Phase 2 (Week 2)
- [ ] Keyboard shortcuts and command palette
- [ ] "My Day" view
- [ ] Advanced filtering and search
- [ ] Task templates

### Phase 3 (Week 3+)
- [ ] Activity log and audit trail
- [ ] Integrations (Slack, email, etc.)
- [ ] Analytics and reporting
- [ ] Advanced features (recurring tasks, subtasks, etc.)

## Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- cmdk (command palette)
- @dnd-kit (drag-and-drop)
- React Query (server state)

**Backend:**
- Drizzle ORM
- PostgreSQL
- Vercel KV (optional, for caching)

**Infrastructure:**
- Vercel (hosting)
- Neon (PostgreSQL)
- GitHub (version control)

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Database Migrations
```bash
npm run db:migrate       # Run pending migrations
npm run db:rollback      # Rollback last migration
npm run db:seed          # Seed development data
```

## Deployment

Automated deployments to Vercel on every push to `main`.

For manual deployment:
```bash
npm run build
vercel deploy --prod
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed setup instructions.

## Contributing

1. Create a branch for your feature
2. Make changes and test locally
3. Push to GitHub
4. Create a pull request
5. Merge after review

## License

Proprietary — Earl AI Assistant

## Support

Questions or issues? Check the [documentation](docs/) or create an issue on GitHub.

---

**Last updated:** March 20, 2026
