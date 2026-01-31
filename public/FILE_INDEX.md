# Earl Dashboard - File Index

Complete listing of all project files and their purposes.

## 📁 Project Root

| File | Purpose |
|------|---------|
| `README.md` | Main documentation and overview |
| `SETUP.md` | Step-by-step setup instructions |
| `OPENCLAW_INTEGRATION.md` | OpenClaw integration guide |
| `DEPLOYMENT_CHECKLIST.md` | Pre/post deployment checklist |
| `PROJECT_SUMMARY.md` | High-level project overview |
| `QUICK_REFERENCE.md` | Quick command reference |
| `BUILD_COMPLETE.md` | Build completion report |
| `TEST_DATA.sql` | Sample data for testing |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.mjs` | PostCSS configuration |
| `vercel.json` | Vercel deployment + cron config |
| `.env.example` | Environment variable template |
| `.env.local` | Local environment (gitignored) |
| `.gitignore` | Git ignore rules |
| `middleware.ts` | Auth middleware |

## 📂 app/ (Next.js App Router)

### Root Files
| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout with auth check |
| `page.tsx` | Dashboard (Kanban board) |
| `globals.css` | Global styles + dark mode |

### app/login/
| File | Purpose |
|------|---------|
| `page.tsx` | Login page |

### app/docs/
| File | Purpose |
|------|---------|
| `page.tsx` | Document management page |

### app/activity/
| File | Purpose |
|------|---------|
| `page.tsx` | Activity log page |

### app/api/sync/
| File | Purpose |
|------|---------|
| `route.ts` | Sync API endpoint (GET/POST) |

### app/api/webhook/
| File | Purpose |
|------|---------|
| `route.ts` | OpenClaw webhook receiver |

## 📂 components/

| File | Purpose |
|------|---------|
| `KanbanBoard.tsx` | Drag-and-drop Kanban board |
| `Sidebar.tsx` | Navigation sidebar |

## 📂 lib/

| File | Purpose |
|------|---------|
| `types.ts` | TypeScript type definitions |
| `utils.ts` | Utility functions |
| `openclaw.ts` | OpenClaw integration logic |

### lib/supabase/
| File | Purpose |
|------|---------|
| `client.ts` | Browser Supabase client |
| `server.ts` | Server Supabase client |
| `middleware.ts` | Auth middleware helper |

## 📂 supabase/migrations/

| File | Purpose |
|------|---------|
| `20240101000000_initial_schema.sql` | Database schema |

## 📊 File Statistics

- **Total Files:** 31
- **TypeScript/TSX:** 16
- **Documentation:** 7
- **Configuration:** 7
- **SQL:** 2

---

**Last Updated:** January 30, 2025
