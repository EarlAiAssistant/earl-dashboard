# Earl Dashboard - Quick Reference Card

## 🚀 Essential Commands

### Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server (http://localhost:3000)
npm run build       # Build for production
npm start           # Run production build
npm run lint        # Lint code
npm run type-check  # Check TypeScript types
```

### Git
```bash
git status          # Check changes
git add .           # Stage all changes
git commit -m "msg" # Commit with message
git push            # Push to remote
```

### Deployment (Vercel)
```bash
vercel              # Deploy to preview
vercel --prod       # Deploy to production
vercel logs         # View logs
vercel env ls       # List environment variables
```

---

## 🔑 Essential URLs

**Local Development:**
- Dashboard: http://localhost:3000
- Login: http://localhost:3000/login

**Production (after deployment):**
- Dashboard: https://earl-dashboard.vercel.app (or your custom domain)
- Webhook: https://earl-dashboard.vercel.app/api/webhook
- Sync: https://earl-dashboard.vercel.app/api/sync

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Your Project: https://app.supabase.com/project/YOUR-PROJECT-ID

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Your Project: https://vercel.com/YOUR-USERNAME/earl-dashboard

---

## 📋 Supabase Quick Actions

### Run Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20240101000000_initial_schema.sql`
3. Paste and click **Run**

### Add Test Data
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `TEST_DATA.sql`
3. Paste and click **Run**

### Create User
1. Go to Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter email and password
4. Enable "Auto Confirm User"

### View Data
```sql
-- View all tasks
SELECT * FROM tasks ORDER BY created_at DESC;

-- View all activities
SELECT * FROM activity_log ORDER BY created_at DESC;

-- View all documents
SELECT * FROM documents ORDER BY uploaded_at DESC;

-- Count by status
SELECT status, COUNT(*) FROM tasks GROUP BY status;
```

---

## 🔌 OpenClaw Integration

### Webhook Test
```bash
curl -X POST https://your-app.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{
    "timestamp": "2024-01-01T12:00:00Z",
    "type": "tool_call",
    "tool": "exec",
    "content": "Test activity",
    "status": "completed",
    "session_key": "test-123"
  }'
```

### Manual Sync
```bash
curl -X POST https://your-app.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## 🐛 Troubleshooting Quick Fixes

### "Can't connect to Supabase"
```bash
# Check environment variables
cat .env.local

# Verify they match Supabase dashboard
# Settings → API
```

### "Build failed"
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### "Tasks not showing"
```sql
-- Check if tasks exist in database
SELECT * FROM tasks;

-- If empty, insert test task
INSERT INTO tasks (title, status) 
VALUES ('Test Task', 'backlog');
```

### "File upload fails"
1. Check Storage bucket exists (Supabase → Storage → `documents`)
2. Verify RLS policies are enabled
3. Check file size (max 50MB on free tier)

### "Webhook not working"
```bash
# Test endpoint accessibility
curl https://your-app.vercel.app/api/webhook

# Check Vercel logs
vercel logs --follow

# Verify webhook secret matches
```

---

## 📁 Important File Locations

### Configuration
- `.env.local` - Local environment variables
- `vercel.json` - Vercel deployment config
- `middleware.ts` - Auth protection
- `tsconfig.json` - TypeScript config

### Database
- `supabase/migrations/` - Database schema
- `TEST_DATA.sql` - Sample data

### Pages
- `app/page.tsx` - Dashboard (Kanban)
- `app/docs/page.tsx` - Documents
- `app/activity/page.tsx` - Activity Log
- `app/login/page.tsx` - Login

### Components
- `components/KanbanBoard.tsx` - Drag-and-drop board
- `components/Sidebar.tsx` - Navigation

### API
- `app/api/sync/route.ts` - Sync endpoint
- `app/api/webhook/route.ts` - Webhook receiver

### Integration
- `lib/openclaw.ts` - OpenClaw integration logic
- `lib/types.ts` - TypeScript types
- `lib/utils.ts` - Helper functions

---

## 🔐 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never commit `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Use strong webhook secret (32+ characters)
- [ ] Use strong password for Drew's account
- [ ] Enable Row Level Security on all tables
- [ ] Only use service role key server-side

---

## 📊 Monitoring

### Check System Health
```bash
# Vercel logs
vercel logs

# Supabase logs
# Go to Dashboard → Database → Logs

# Browser console
# F12 → Console tab
```

### Performance Metrics
- Page load: Should be < 3 seconds
- Task update delay: ~30 seconds (polling interval)
- File upload: Works for files up to 50MB

---

## 🎯 Common Tasks

### Add a Manual Task
```sql
INSERT INTO tasks (title, description, status)
VALUES (
  'My Task',
  'Task description here',
  'backlog'  -- or 'in_progress' or 'done'
);
```

### Add Manual Activity
```sql
INSERT INTO activity_log (action_type, details, status)
VALUES (
  'tool_call',
  'Earl did something',
  'completed'
);
```

### Update Task Status
```sql
UPDATE tasks 
SET status = 'done', 
    completed_at = NOW() 
WHERE id = 'TASK-UUID-HERE';
```

### Delete Old Activities
```sql
DELETE FROM activity_log 
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## 📞 Support Resources

**Documentation:**
- `README.md` - Main documentation
- `SETUP.md` - Setup guide
- `OPENCLAW_INTEGRATION.md` - Integration guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `PROJECT_SUMMARY.md` - Overview

**External Docs:**
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Vercel](https://vercel.com/docs)
- [Tailwind](https://tailwindcss.com/docs)

**Tools:**
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub](https://github.com)

---

## 🎉 Success Indicators

Your dashboard is working correctly when:

✅ Can access and log in
✅ Tasks appear in Kanban board
✅ Can drag tasks between columns
✅ Files upload successfully
✅ Activity log shows entries
✅ Real-time updates work (<30s)
✅ Dark mode toggle works
✅ Mobile responsive
✅ No console errors

---

## 💡 Pro Tips

1. **Bookmark the dashboard** - Easy access
2. **Save credentials in password manager** - Don't lose them
3. **Check Vercel logs regularly** - Catch issues early
4. **Run test data on fresh setup** - Verify everything works
5. **Set up monitoring** - Track uptime and performance
6. **Backup Supabase data** - Export periodically
7. **Keep dependencies updated** - `npm update`

---

**Quick Reference v1.0 | Built for Drew & Earl**
