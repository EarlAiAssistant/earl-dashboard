# Customer Health Dashboard - Implementation Spec

**Status:** ✅ Complete and Ready for Deployment  
**Date:** January 31, 2026  
**URL:** `/admin/health`

---

## 1. Overview

Internal dashboard for monitoring customer health metrics including trial signups, conversion rates, churn, usage patterns, and at-risk users.

### Business Value
- **Early warning system:** Identify at-risk users before they churn
- **Data-driven decisions:** Track trial-to-paid conversion
- **Revenue visibility:** Real-time MRR tracking
- **Proactive outreach:** One-click email to at-risk users

---

## 2. Files Created

```
app/api/admin/health/route.ts      (9.1 KB) - API endpoint for metrics
components/admin/CustomerHealthDashboard.tsx (14.3 KB) - React dashboard
app/admin/health/page.tsx          (0.5 KB) - Page wrapper
customer-health-dashboard-spec.md  (this file)
```

**Total Code:** ~24 KB

---

## 3. Metrics Tracked

### Trial & Conversion
| Metric | Description |
|--------|-------------|
| Trials Today | New trial signups today |
| Trials This Week | New trial signups in last 7 days |
| Trials This Month | New trial signups in last 30 days |
| Active Trials | Trials that haven't expired |
| Trial → Paid Rate | % of expired trials that converted |

### Revenue & Subscriptions
| Metric | Description |
|--------|-------------|
| MRR | Monthly recurring revenue (calculated from tiers) |
| Active Subscriptions | Total paying customers |
| By Tier | Breakdown by Starter/Pro/Agency/Enterprise |
| Churn This Month | Canceled in last 30 days |
| Churn Rate | % of subscribers who churned |

### Usage
| Metric | Description |
|--------|-------------|
| Avg Transcripts/User | Average usage per active user |
| Total This Month | Total transcripts processed |
| Heavy Users | Users at 80%+ of their limit |

### At-Risk Users
| Risk Level | Criteria |
|------------|----------|
| High | No login in 14+ days OR paying with 0 usage |
| Medium | No login in 7-14 days OR <10% usage |

---

## 4. At-Risk Detection Algorithm

```typescript
function identifyAtRiskUsers(users, now) {
  return users
    .filter(activeOrTrial)
    .map(user => {
      // Calculate days since last login
      const daysInactive = daysSince(user.last_login_at);
      
      // Calculate usage percentage
      const usagePercent = user.transcripts_used / user.limit;
      
      // Determine risk
      if (daysInactive >= 14) {
        return { riskLevel: 'high', reason: `No login in ${daysInactive} days` };
      }
      if (daysInactive >= 7) {
        return { riskLevel: 'medium', reason: `No login in ${daysInactive} days` };
      }
      if (usagePercent === 0 && user.status === 'active') {
        return { riskLevel: 'high', reason: 'Paying but zero usage' };
      }
      if (usagePercent < 0.1 && user.status === 'active') {
        return { riskLevel: 'medium', reason: 'Very low usage (<10%)' };
      }
      return { riskLevel: 'low' };
    })
    .filter(u => u.riskLevel !== 'low')
    .sort(byRiskThenDaysInactive)
    .slice(0, 20);
}
```

---

## 5. UI Components

### MetricCard
4 key metrics with color-coded cards:
- **MRR** (green) - Revenue health
- **Trial → Paid** (blue) - Conversion health
- **Churn Rate** (red/gray) - Retention health
- **At-Risk Users** (yellow/red) - Warning count

### Trial Signups Panel
- Today/Week/Month counts
- 30-day sparkline chart

### Usage Panel
- Avg/User, Total, Heavy Users
- Subscriptions by tier breakdown

### At-Risk Users Table
- Email, tier, usage, last login
- Risk level badge with reason
- One-click email action
- Expandable (show top 5 or all)

---

## 6. API Endpoint

### GET /api/admin/health

**Authentication:**
```typescript
// Check admin API key in production
const apiKey = request.headers.get('x-admin-key')
if (apiKey !== process.env.ADMIN_API_KEY && process.env.NODE_ENV === 'production') {
  return 401 Unauthorized
}
```

**Response:**
```typescript
interface HealthMetrics {
  trialsToday: number
  trialsThisWeek: number
  trialsThisMonth: number
  trialToPaidRate: number
  activeTrials: number
  activeSubscriptions: number
  subscriptionsByTier: Record<string, number>
  mrr: number
  churnThisMonth: number
  churnRate: number
  avgTranscriptsPerUser: number
  totalTranscriptsThisMonth: number
  heavyUsers: number
  atRiskUsers: AtRiskUser[]
  dailySignups: DailyMetric[]
  dailyConversions: DailyMetric[]
}
```

---

## 7. Deployment Steps

### Step 1: Add Environment Variable (1 min)

```env
# .env.local
ADMIN_API_KEY=your-secret-admin-key-here
```

### Step 2: Deploy Files (5 min)

Deploy:
- `app/api/admin/health/route.ts`
- `components/admin/CustomerHealthDashboard.tsx`
- `app/admin/health/page.tsx`

### Step 3: Add Database Columns (if missing)

Make sure users table has:
- `last_login_at TIMESTAMPTZ`
- `transcripts_used_this_month INTEGER`
- `current_period_end TIMESTAMPTZ`
- `trial_ends_at TIMESTAMPTZ`

### Step 4: Test (5 min)

1. Navigate to `/admin/health`
2. Verify all metrics load
3. Check at-risk user detection
4. Test email action button

---

## 8. Security Considerations

### Access Control

**Option 1: API Key (implemented)**
```typescript
const apiKey = request.headers.get('x-admin-key')
```

**Option 2: User Role Check (recommended for production)**
```typescript
const { user } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') {
  return 403 Forbidden
}
```

### Rate Limiting
Consider adding rate limiting to prevent abuse:
- Max 60 requests/minute per IP
- Cache results for 30 seconds

---

## 9. Future Enhancements

### Email Alerts
Automated alerts when:
- High-risk users detected
- Churn rate exceeds threshold
- Trial conversion drops below target

```typescript
// Example cron job (daily)
const atRisk = await getAtRiskUsers()
const highRisk = atRisk.filter(u => u.riskLevel === 'high')

if (highRisk.length > 5) {
  await sendEmail({
    to: 'drew@call-content.com',
    subject: `⚠️ ${highRisk.length} high-risk users detected`,
    body: generateAtRiskReport(highRisk)
  })
}
```

### Cohort Analysis
Track metrics by signup cohort:
- Week 1 retention by signup month
- Time to first transcript
- Feature adoption rates

### Comparison Metrics
Show week-over-week and month-over-month changes:
- MRR growth %
- Trial signup trend
- Churn trend

### Export
Add CSV/PDF export for:
- At-risk user list
- Monthly metrics report
- Churn analysis

---

## 10. MRR Calculation

```typescript
const tierPrices = {
  starter: 97,
  professional: 197,
  agency: 497,
  enterprise: 1200,
}

const mrr = Object.entries(subscriptionsByTier).reduce(
  (sum, [tier, count]) => sum + (tierPrices[tier] || 0) * count,
  0
)
```

---

## 11. Summary

✅ **API Endpoint:** `/api/admin/health` - Returns all metrics  
✅ **Dashboard:** `/admin/health` - Visual dashboard  
✅ **At-Risk Detection:** Automatic identification with reasons  
✅ **One-Click Actions:** Email at-risk users directly  
✅ **Auto-Refresh:** Updates every 5 minutes  
✅ **30-Day Charts:** Sparklines for signup trends  

**Total Implementation:** ~24 KB of code  
**Deployment Time:** ~15 minutes  

**Ready to ship! 🚀**
