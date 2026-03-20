# Onboarding Checklist Testing Guide

Comprehensive testing guide for the onboarding checklist feature.

## 🧪 Test Environment Setup

### 1. Create Test User Account

```bash
# Sign up with a new email for testing
Email: test-onboarding@example.com
Password: TestPassword123!
```

### 2. Reset Test Data

```sql
-- Run this in Supabase SQL Editor to reset test user's onboarding
DELETE FROM user_onboarding 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'test-onboarding@example.com'
);

-- Clear localStorage
-- In browser console:
localStorage.clear()
```

---

## ✅ Test Cases

### Test 1: First-Time User Experience

**Steps:**
1. Sign up as a new user
2. Get redirected to dashboard

**Expected:**
- ✅ Welcome modal appears immediately
- ✅ Modal shows "Welcome to Call-Content! 🎉"
- ✅ 3 steps are listed in the modal
- ✅ "Let's Get Started!" button is visible

**Analytics Events:**
- `onboarding_modal_viewed`

---

### Test 2: Welcome Modal Interaction

**Steps:**
1. Click "Let's Get Started!" button

**Expected:**
- ✅ Modal closes
- ✅ Checklist appears on dashboard
- ✅ Modal doesn't appear again on refresh

**Analytics Events:**
- `onboarding_modal_get_started_clicked`

---

### Test 3: Checklist Initial State

**Steps:**
1. View the onboarding checklist

**Expected:**
- ✅ Checklist has gradient blue background
- ✅ "Getting Started" header is visible
- ✅ Progress bar shows 0%
- ✅ 3 steps are listed:
  - Upload your first transcript (incomplete)
  - Generate your first content (incomplete)
  - Export your content (incomplete)
- ✅ All steps have gray circle icons (not completed)
- ✅ X button in top-right corner

**Analytics Events:**
- `onboarding_checklist_viewed`

---

### Test 4: Step 1 - Upload Transcript

**Steps:**
1. Click on "Upload your first transcript" step
2. Upload a transcript or audio file
3. Wait for upload to complete
4. Return to dashboard

**Expected:**
- ✅ Clicking step redirects to upload page
- ✅ After successful upload, step 1 shows:
  - Green checkmark icon ✓
  - Text has strikethrough
  - Step is marked as completed
- ✅ Progress bar updates to 33%
- ✅ Analytics event fired

**Analytics Events:**
- `onboarding_step_clicked` (step: 'upload')
- `onboarding_step_completed` (step: 'upload')

---

### Test 5: Step 2 - Generate Content

**Steps:**
1. Click on "Generate your first content" step
2. Generate any content (blog post, case study, etc.)
3. Return to dashboard

**Expected:**
- ✅ Step 2 shows completed (green checkmark)
- ✅ Progress bar updates to 67%
- ✅ Step 1 remains completed
- ✅ Analytics event fired

**Analytics Events:**
- `onboarding_step_clicked` (step: 'generate')
- `onboarding_step_completed` (step: 'generate')

---

### Test 6: Step 3 - Export Content

**Steps:**
1. Click on "Export your content" step
2. Download or copy generated content
3. Return to dashboard

**Expected:**
- ✅ Step 3 shows completed (green checkmark)
- ✅ Progress bar updates to 100%
- ✅ All steps show green checkmarks
- ✅ Completion message appears:
  - "🎉 Congratulations! You're all set up."
  - Green background
- ✅ Analytics event fired

**Analytics Events:**
- `onboarding_step_clicked` (step: 'export')
- `onboarding_step_completed` (step: 'export')
- `onboarding_completed` (time_to_complete: X seconds)

---

### Test 7: Checklist Dismissal

**Steps:**
1. Click X button in top-right corner of checklist

**Expected:**
- ✅ Checklist disappears immediately
- ✅ Checklist doesn't reappear on page refresh
- ✅ Database updated (is_dismissed = true)
- ✅ Analytics event fired

**Analytics Events:**
- `onboarding_skipped` (step: '1/3' or '2/3' etc.)

---

### Test 8: Persistence Across Sessions

**Steps:**
1. Complete step 1
2. Log out
3. Log back in

**Expected:**
- ✅ Checklist still shows on dashboard
- ✅ Step 1 remains completed
- ✅ Progress bar shows 33%
- ✅ Welcome modal does NOT appear again

---

### Test 9: Mobile Responsiveness

**Steps:**
1. Open dashboard on mobile device (or resize browser to mobile width)

**Expected:**
- ✅ Welcome modal is readable and scrollable
- ✅ Checklist fits on screen
- ✅ Progress bar is visible
- ✅ All buttons are tappable
- ✅ Text is readable (no overflow)

**Test on:**
- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad)

---

### Test 10: Completed Onboarding Behavior

**Steps:**
1. Complete all 3 steps
2. Refresh page
3. Navigate to other pages and back

**Expected:**
- ✅ Checklist shows completion message
- ✅ After a few seconds, checklist auto-dismisses (optional feature)
- ✅ Checklist doesn't appear on future visits
- ✅ Database: is_completed = true, completed_at is set

---

### Test 11: Edge Case - Rapid Clicking

**Steps:**
1. Rapidly click on the same step multiple times

**Expected:**
- ✅ No duplicate API calls
- ✅ No errors in console
- ✅ Step completes only once

---

### Test 12: Edge Case - Offline Mode

**Steps:**
1. Disconnect from internet
2. Try to interact with checklist

**Expected:**
- ✅ Graceful error handling
- ✅ User sees loading state or error message
- ✅ No app crash

---

### Test 13: Database Validation

**Steps:**
1. Complete all steps
2. Check Supabase database

**Expected SQL Query:**
```sql
SELECT * FROM user_onboarding 
WHERE user_id = 'your-user-id'
LIMIT 1;
```

**Expected Results:**
- ✅ `has_uploaded_transcript = true`
- ✅ `has_generated_content = true`
- ✅ `has_exported_content = true`
- ✅ `is_completed = true`
- ✅ `steps_completed = 3`
- ✅ `total_steps = 3`
- ✅ `completed_at` is set
- ✅ `time_to_complete_seconds` has a value

---

### Test 14: Analytics Validation

**Steps:**
1. Complete the full onboarding flow
2. Open PostHog dashboard

**Expected:**
- ✅ All events appear in PostHog
- ✅ Event properties are correct
- ✅ User is identified (user_id matches)

**Events to verify:**
1. `onboarding_modal_viewed`
2. `onboarding_modal_get_started_clicked`
3. `onboarding_checklist_viewed`
4. `onboarding_step_clicked` (3 times)
5. `onboarding_step_completed` (3 times)
6. `onboarding_completed`

---

## 🔧 Debugging Tools

### Check Onboarding Status in Console

```javascript
// Open browser console and run:
fetch('/api/onboarding/status')
  .then(r => r.json())
  .then(console.log)

// Expected output:
{
  id: "uuid",
  user_id: "uuid",
  has_uploaded_transcript: false,
  has_generated_content: false,
  has_exported_content: false,
  is_completed: false,
  is_dismissed: false,
  steps_completed: 0,
  total_steps: 3,
  ...
}
```

### Manually Complete a Step

```javascript
// Open browser console and run:
fetch('/api/onboarding/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ step: 'has_uploaded_transcript' })
})
  .then(r => r.json())
  .then(console.log)
```

### Check PostHog Events

```javascript
// In browser console:
console.log(posthog.__loaded) // Should be true
posthog.capture('test_event', { test: true }) // Manual test event
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Checklist Not Showing

**Symptoms:**
- Dashboard loads but no checklist appears

**Debug:**
```javascript
// Check authentication
fetch('/api/onboarding/status').then(r => console.log(r.status))
// 401 = not authenticated
// 200 = authenticated, check response data

// Check localStorage
console.log(localStorage.getItem('onboarding_modal_seen'))
```

**Solutions:**
- Make sure user is logged in
- Check if `is_dismissed = true` in database
- Verify component is imported in `app/page.tsx`

---

### Issue 2: Steps Not Completing

**Symptoms:**
- Actions performed but steps stay incomplete

**Debug:**
```javascript
// Check if API is being called
// Add this to your upload/generate/export handlers:
console.log('About to mark step complete')
await markOnboardingStepComplete('has_uploaded_transcript')
console.log('Step marked complete')
```

**Solutions:**
- Verify `markOnboardingStepComplete()` is called after action
- Check network tab for failed API requests
- Verify correct step name is used

---

### Issue 3: Analytics Not Tracking

**Symptoms:**
- Events don't appear in PostHog

**Debug:**
```javascript
// Check PostHog initialization
console.log(window.posthog)
console.log(process.env.NEXT_PUBLIC_POSTHOG_KEY)
```

**Solutions:**
- Verify PostHog API key is set in `.env.local`
- Check PostHog provider is in `app/layout.tsx`
- Test with manual event: `posthog.capture('test')`

---

### Issue 4: Welcome Modal Shows Every Time

**Symptoms:**
- Modal appears on every page load

**Debug:**
```javascript
// Check localStorage
console.log(localStorage.getItem('onboarding_modal_seen'))
// Should be 'true' after first view
```

**Solutions:**
- Clear browser cache and cookies
- Check if localStorage is blocked by browser settings
- Verify modal's `handleClose` and `handleGetStarted` functions

---

## 📊 Performance Testing

### Load Time

**Test:**
1. Open dashboard with onboarding checklist
2. Measure time to interactive

**Expected:**
- ✅ Checklist renders in < 500ms
- ✅ No layout shift (CLS score = 0)
- ✅ No blocking JavaScript

### API Response Time

**Test:**
```bash
# Test status endpoint
time curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.com/api/onboarding/status

# Test complete endpoint
time curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"step":"has_uploaded_transcript"}' \
  https://your-app.com/api/onboarding/complete
```

**Expected:**
- ✅ GET /api/onboarding/status: < 200ms
- ✅ POST /api/onboarding/complete: < 300ms

---

## 🎯 Acceptance Criteria

Before marking this feature as "done", verify:

- [ ] All 14 test cases pass
- [ ] Welcome modal works correctly
- [ ] All 3 steps can be completed
- [ ] Progress bar updates correctly
- [ ] Checklist can be dismissed
- [ ] State persists across sessions
- [ ] Mobile responsive
- [ ] Analytics events tracked
- [ ] Database updates correctly
- [ ] No console errors
- [ ] Performance benchmarks met
- [ ] Works in Chrome, Firefox, Safari
- [ ] Accessibility (keyboard navigation works)

---

## 🚀 Deployment Testing

### Staging Environment

1. Deploy to staging
2. Run all test cases
3. Verify analytics in PostHog
4. Check database migrations applied

### Production Environment

1. Deploy to production
2. Create real test user account
3. Complete full onboarding flow
4. Monitor error logs for 24 hours
5. Check analytics dashboard for events

---

## 📈 Post-Launch Monitoring

**Week 1 Metrics to Watch:**

```sql
-- Onboarding completion rate
SELECT 
  COUNT(*) FILTER (WHERE is_completed = true) * 100.0 / COUNT(*) as completion_rate,
  AVG(time_to_complete_seconds) / 60 as avg_minutes_to_complete
FROM user_onboarding
WHERE created_at > NOW() - INTERVAL '7 days';

-- Step-by-step completion
SELECT 
  COUNT(*) FILTER (WHERE has_uploaded_transcript = true) * 100.0 / COUNT(*) as step1_rate,
  COUNT(*) FILTER (WHERE has_generated_content = true) * 100.0 / COUNT(*) as step2_rate,
  COUNT(*) FILTER (WHERE has_exported_content = true) * 100.0 / COUNT(*) as step3_rate
FROM user_onboarding
WHERE created_at > NOW() - INTERVAL '7 days';

-- Dismiss rate
SELECT 
  COUNT(*) FILTER (WHERE is_dismissed = true) * 100.0 / COUNT(*) as dismiss_rate
FROM user_onboarding
WHERE created_at > NOW() - INTERVAL '7 days';
```

**Target Metrics:**
- Step 1 completion: 60%+
- Step 2 completion: 50%+
- Step 3 completion: 40%+
- Full completion: 40%+
- Dismiss rate: < 20%
- Time to complete: < 10 minutes median

---

**Ready to ship! 🚀**
