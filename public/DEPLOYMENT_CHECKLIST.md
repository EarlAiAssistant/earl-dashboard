# Deployment Checklist for Earl Dashboard

Use this checklist to ensure smooth deployment.

## Pre-Deployment

### ✅ Supabase Configuration

- [ ] Supabase project created
- [ ] Database migration executed (check SQL Editor history)
- [ ] Storage bucket `documents` created
- [ ] RLS policies enabled on all tables
- [ ] User account created (Drew's credentials)
- [ ] Project URL and API keys copied

### ✅ Environment Variables

- [ ] `.env.local` created from `.env.example`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (keep secret!)
- [ ] `OPENCLAW_WEBHOOK_SECRET` generated and set

### ✅ Local Testing

- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can log in with test credentials
- [ ] Dashboard loads (even if empty)
- [ ] Can navigate between tabs (Dashboard, Docs, Activity)
- [ ] Can upload a test file
- [ ] Dark mode toggle works

### ✅ Database Testing

- [ ] Created test task in Supabase SQL Editor
- [ ] Test task appears in dashboard
- [ ] Can drag task between columns
- [ ] Created test activity log entry
- [ ] Test activity appears in Activity Log tab

## Deployment to Vercel

### ✅ GitHub Setup

- [ ] Git repository initialized
- [ ] `.gitignore` includes `.env*.local`
- [ ] All files committed
- [ ] Pushed to GitHub (main branch)

### ✅ Vercel Project Setup

- [ ] Vercel account created/logged in
- [ ] New project created from GitHub repo
- [ ] Framework preset: Next.js (auto-detected)
- [ ] All environment variables added:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `OPENCLAW_WEBHOOK_SECRET`
- [ ] First deployment triggered
- [ ] Build completed successfully (no errors)
- [ ] Production URL accessible

### ✅ Production Testing

- [ ] Can access production URL
- [ ] Can log in with credentials
- [ ] Dashboard loads correctly
- [ ] All tabs work (Dashboard, Docs, Activity)
- [ ] Can upload file to production
- [ ] Can download uploaded file
- [ ] Can delete file
- [ ] Task drag-and-drop works
- [ ] Search in Activity Log works
- [ ] Date filter works
- [ ] Dark mode persists across page refresh

### ✅ Vercel Configuration

- [ ] Domain configured (optional)
- [ ] Cron job visible in Settings → Cron Jobs
- [ ] Cron schedule: `*/30 * * * *` (every 30 min)
- [ ] Cron path: `/api/sync`
- [ ] Deployment logs accessible (no errors)

## OpenClaw Integration

### ✅ Webhook Setup (if using)

- [ ] Webhook URL: `https://your-app.vercel.app/api/webhook`
- [ ] Webhook secret configured in OpenClaw
- [ ] Test webhook with curl:
  ```bash
  curl -X POST https://your-app.vercel.app/api/webhook \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer your-secret" \
    -d '{"timestamp":"2024-01-01T12:00:00Z","type":"test","content":"Test"}'
  ```
- [ ] Webhook test appears in Activity Log

### ✅ Polling Setup (if using)

- [ ] OpenClaw API endpoint configured in code
- [ ] Polling logic implemented in `lib/openclaw.ts`
- [ ] Cron job tested (check Vercel logs after 30 min)

### ✅ File Watching Setup (if using)

- [ ] Watcher script created
- [ ] File path configured
- [ ] Watcher running as service
- [ ] Test file created and detected

## Post-Deployment

### ✅ Monitoring

- [ ] Vercel logs configured (check for errors)
- [ ] Supabase dashboard checked (query count, storage usage)
- [ ] Browser console checked (no JS errors)
- [ ] Real-time updates working (create task in Supabase → appears in dashboard)

### ✅ Security

- [ ] `.env.local` NOT committed to Git
- [ ] Service role key only used server-side
- [ ] Webhook secret is random and strong
- [ ] User password is strong
- [ ] Supabase RLS policies tested

### ✅ Performance

- [ ] Page load time < 3 seconds
- [ ] File upload works for files up to 10MB
- [ ] Dashboard auto-refreshes every 30 seconds
- [ ] No memory leaks (check browser dev tools)

### ✅ Documentation

- [ ] README.md reviewed
- [ ] SETUP.md reviewed
- [ ] OPENCLAW_INTEGRATION.md reviewed
- [ ] Credentials saved in password manager
- [ ] Bookmark dashboard URL

## Optional Enhancements

### Nice to Have

- [ ] Custom domain configured
- [ ] Analytics added (Vercel Analytics)
- [ ] Error tracking (Sentry)
- [ ] Email notifications for critical tasks
- [ ] Mobile responsive testing
- [ ] Backup strategy for Supabase data

### Future Improvements

- [ ] Real-time WebSocket instead of polling
- [ ] Task comments and collaboration
- [ ] Advanced filtering and sorting
- [ ] Export to CSV
- [ ] Dashboard analytics/charts
- [ ] Mobile app

## Troubleshooting

If something doesn't work:

1. **Check Vercel Logs:**
   ```bash
   vercel logs --follow
   ```

2. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Database → Logs

3. **Check Browser Console:**
   - Open DevTools (F12) → Console tab

4. **Test API Endpoints:**
   ```bash
   # Test sync endpoint
   curl https://your-app.vercel.app/api/sync
   
   # Test webhook endpoint
   curl https://your-app.vercel.app/api/webhook
   ```

5. **Verify Environment Variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - Ensure all variables are set for Production

6. **Check Supabase Connection:**
   - Supabase Dashboard → Project Settings → API
   - Verify URL and keys match environment variables

7. **Clear Cache:**
   - Browser: Ctrl+Shift+R (hard refresh)
   - Vercel: Redeploy with "Clear Cache and Redeploy"

## Success Criteria

Your deployment is successful when:

✅ You can access the production URL
✅ You can log in and see the dashboard
✅ You can create, view, and update tasks
✅ You can upload and download files
✅ Activity log shows entries
✅ OpenClaw integration sends data (webhook or cron)
✅ Real-time updates work within 30 seconds
✅ Everything works on mobile devices

---

## Final Steps

Once everything is checked:

1. ✅ Save all credentials securely
2. ✅ Bookmark dashboard URL
3. ✅ Document any custom changes
4. ✅ Set up monitoring/alerts
5. ✅ Enjoy tracking Earl's activities! 🎉

---

**Need help? Check the main README or open an issue.**
