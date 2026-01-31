# Earl Dashboard

A real-time dashboard for tracking Earl (AI assistant) tasks and activities, built with Next.js 16, TypeScript, and Supabase.

## 🚀 One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FEarlAiAssistant%2Fearl-dashboard&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20credentials%20needed%20for%20the%20dashboard&envLink=https%3A%2F%2Fgithub.com%2FEarlAiAssistant%2Fearl-dashboard%23setup)

Click the button above to deploy to Vercel. You'll need Supabase credentials (see setup guide below).

![Dashboard Preview](https://via.placeholder.com/800x400?text=Earl+Dashboard)

## Features

- 🎯 **Kanban Board** - Visual task tracking with drag-and-drop
- 📁 **Document Management** - Upload, download, and organize files
- 📊 **Activity Log** - Chronological history with search and filters
- 🔐 **Secure Authentication** - Single-user access with Supabase Auth
- ⚡ **Real-time Updates** - Live task and activity synchronization
- 🌙 **Dark Mode** - Modern, eye-friendly interface
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Drag & Drop:** @dnd-kit
- **Deployment:** Vercel

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone <your-repo-url> earl-dashboard
cd earl-dashboard
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   ```bash
   # Copy the contents of supabase/migrations/20240101000000_initial_schema.sql
   # and run it in the Supabase SQL Editor
   ```
3. Go to **Storage** and verify the `documents` bucket was created
4. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this secret!)

### 3. Configure Environment Variables

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OPENCLAW_WEBHOOK_SECRET=your-random-secret-here
```

### 4. Create User Account

In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter Drew's email and password
4. Save the credentials

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the credentials you created.

## OpenClaw Integration

The dashboard can integrate with OpenClaw in three ways:

### Option 1: Webhook (Recommended)

Configure OpenClaw to send POST requests to your webhook endpoint:

```bash
POST https://your-app.vercel.app/api/webhook
Authorization: Bearer your-webhook-secret

{
  "timestamp": "2024-01-01T12:00:00Z",
  "type": "tool_call",
  "tool": "exec",
  "content": "Running build command",
  "status": "running",
  "session_key": "session-abc123"
}
```

### Option 2: API Polling

Set up a cron job to poll OpenClaw's API:

```javascript
// The /api/sync endpoint is automatically called every 30 minutes via Vercel Cron
// Configure this in vercel.json
```

### Option 3: File Watching

If OpenClaw writes session transcripts to files, you can monitor them:

```javascript
// Update lib/openclaw.ts with your transcript directory
// Run a background process to watch for file changes
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from `.env.local`
   - Make sure to add them as **Environment Variables** in Vercel settings
5. Click **Deploy**

### 3. Enable Cron Jobs (Optional)

Vercel Cron will automatically call `/api/sync` every 30 minutes to poll for updates.

Verify in your Vercel project:
- Go to **Settings** → **Cron Jobs**
- Ensure the job is enabled

## Project Structure

```
earl-dashboard/
├── app/
│   ├── api/
│   │   ├── sync/           # Manual sync endpoint
│   │   └── webhook/        # OpenClaw webhook receiver
│   ├── activity/           # Activity log page
│   ├── docs/               # Documents page
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard (Kanban board)
│   └── globals.css         # Global styles
├── components/
│   ├── KanbanBoard.tsx     # Drag-and-drop Kanban
│   └── Sidebar.tsx         # Navigation sidebar
├── lib/
│   ├── supabase/           # Supabase client utilities
│   ├── openclaw.ts         # OpenClaw integration logic
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
├── supabase/
│   └── migrations/         # Database schema
├── .env.example            # Environment variable template
├── middleware.ts           # Auth middleware
└── vercel.json             # Vercel configuration
```

## Usage Guide

### Dashboard (Kanban Board)

- **View Tasks:** See all tasks organized by status (Backlog, In Progress, Done)
- **Drag & Drop:** Move tasks between columns
- **Auto-Refresh:** Tasks update automatically every 30 seconds
- **Task Details:** Click to view session info, timestamps, and metadata

### Documents

- **Upload:** Drag and drop files or click to browse
- **Download:** Click the download button on any document
- **Delete:** Remove documents you no longer need
- **Supported Formats:** PDF, MD, TXT, DOCX, images, and more

### Activity Log

- **Search:** Filter activities by keyword
- **Date Filter:** View activities from specific time periods
- **Load More:** Paginated view with 50 items per page
- **Real-time:** New activities appear automatically

## Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

## Customization

### Change Polling Interval

Edit `vercel.json` to adjust the cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "*/10 * * * *"  // Every 10 minutes
    }
  ]
}
```

### Modify Task Statuses

Edit `lib/types.ts` to add or change task statuses:

```typescript
export type TaskStatus = 'backlog' | 'in_progress' | 'done' | 'blocked'
```

Then update the Kanban board and database schema accordingly.

### Add More Fields

Extend the database schema in `supabase/migrations/` and update TypeScript types in `lib/types.ts`.

## Troubleshooting

### "Unauthorized" Error

- Verify your Supabase environment variables are correct
- Check that the user account exists in Supabase Auth
- Clear browser cookies and try logging in again

### Tasks Not Updating

- Check OpenClaw webhook is configured correctly
- Verify webhook secret matches in both systems
- Test the `/api/webhook` endpoint manually with curl
- Check Vercel Cron is enabled and running

### File Upload Fails

- Verify Supabase Storage bucket `documents` exists
- Check RLS policies are set correctly
- Ensure file size is within Supabase limits (default 50MB)

## Security Notes

- 🔒 **Never commit `.env.local`** - Keep it in `.gitignore`
- 🔐 **Protect service role key** - Only use server-side
- 🛡️ **Use webhook secrets** - Validate incoming requests
- 👤 **Single user only** - For multi-user, add RLS policies

## Future Enhancements

- [ ] Real-time WebSocket updates (instead of polling)
- [ ] Task comments and notes
- [ ] Advanced filtering and sorting
- [ ] Export activity logs to CSV
- [ ] Dashboard analytics and charts
- [ ] Mobile app (React Native)
- [ ] Notifications for important events

## Contributing

This is a single-user app for Drew, but feel free to fork and customize for your own use!

## License

MIT

## Support

For issues or questions, open an issue on GitHub.

---

**Built with ❤️ for Drew and Earl**
