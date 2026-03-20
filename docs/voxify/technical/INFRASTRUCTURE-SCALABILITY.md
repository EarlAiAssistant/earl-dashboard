# Voxify Infrastructure Scalability & Cost Analysis

*Research on Vercel + Supabase for scaling from 0 to 10K+ users*

---

## Executive Summary

**TL;DR:** Vercel + Supabase is a solid choice for Voxify up to ~1,000+ paying users. After that, you'll want to evaluate costs carefully, but migration isn't necessary until much later (if ever).

| Stage | Users | Est. Monthly Cost | Verdict |
|-------|-------|-------------------|---------|
| MVP/Launch | 0-100 | $20-50 | ✅ Perfect fit |
| Growth | 100-500 | $50-150 | ✅ Still good |
| Scale | 500-1,000 | $150-400 | ✅ Cost-effective |
| Mature | 1,000-10,000 | $400-2,000 | ⚠️ Monitor closely |

---

## Current Setup

**Vercel Pro**: $20/month base
- 60-second function timeout (critical for Claude API calls)
- 1TB bandwidth included
- 10M edge requests included

**Supabase Free**: $0/month
- 500MB database
- 50K MAUs (monthly active users)
- 500K edge function invocations
- Project pauses after 1 week of inactivity ⚠️

---

## Vercel Analysis

### What You Get on Pro ($20/mo)

| Resource | Included | Overage |
|----------|----------|---------|
| Edge Requests | 10M/mo | $2/1M |
| Bandwidth | 1TB/mo | $0.15/GB |
| Function Invocations | 1M/mo | $0.60/1M |
| Function Active CPU | 4 hrs/mo | $0.128/hr |
| Function Memory | 360 GB-hrs/mo | $0.01/GB-hr |
| Image Optimization | 5K/mo | $0.05/1K |
| Build Minutes | Pay-as-you-go | $0.014/min |

### Voxify-Specific Concerns

**Function Timeout**: ✅ 60 seconds on Pro (you need this for Claude API)

**Function Duration for Voxify**:
- Each transcript processing = ~30-60 seconds of Claude API time
- At 100 users doing 10 transcripts/month = 1,000 transcripts
- Estimated function time: 1,000 × 45 sec = 12.5 hours
- **Cost**: 12.5 hrs × $0.128 = **~$1.60/month** ✅ negligible

**Bandwidth**:
- Transcript uploads are text (small)
- Results pages are text (small)
- 1TB is more than enough for years

### Vercel Scaling Limits

| Metric | Limit | Voxify Impact |
|--------|-------|---------------|
| Concurrent Functions | 1,000 (Enterprise only) | Could hit with viral traffic |
| Function Memory | 3GB max | Plenty for text processing |
| Function Duration | 60s (Pro) / 5min (Enterprise) | 60s is enough |
| Deployments/day | 6,000 | No issue |

### Vercel Cost Projection

| Users | Transcripts/mo | Est. Vercel Cost |
|-------|----------------|------------------|
| 100 | 500 | $20 (base only) |
| 500 | 2,500 | $25-30 |
| 1,000 | 5,000 | $30-50 |
| 5,000 | 25,000 | $75-150 |
| 10,000 | 50,000 | $150-300 |

**Verdict**: Vercel scales well. Costs are predictable and reasonable.

---

## Supabase Analysis

### Free Tier Limits (Current)

| Resource | Limit | Risk Level |
|----------|-------|------------|
| Database Size | 500MB | 🟡 Medium - will hit at ~500-1K users |
| MAUs | 50K | 🟢 Low - plenty of headroom |
| Edge Invocations | 500K | 🟢 Low - plenty |
| Egress | 5GB | 🟡 Medium - depends on usage |
| **Project Pauses** | After 1 week inactive | 🔴 HIGH - bad for production! |

### ⚠️ Critical Issue: Project Pausing

**On Free tier, Supabase pauses your database after 1 week of inactivity.**

This means:
- If no one uses Voxify for 7 days, database goes offline
- Users get errors until you manually unpause
- **RECOMMENDATION: Upgrade to Pro ($25/mo) before launch**

### Supabase Pro ($25/mo)

| Resource | Included | Overage |
|----------|----------|---------|
| Database Size | 8GB | $0.125/GB |
| MAUs | 100K | $0.00325/MAU |
| Storage | 100GB | $0.021/GB |
| Egress | 250GB | $0.09/GB |
| Edge Invocations | 2M | $2/1M |
| Realtime Messages | 5M | $2.50/1M |
| No project pausing | ✅ | - |

### Database Size Estimation

**Per user storage** (rough estimate):
- User record: ~1KB
- Per transcript: ~50KB (original text + metadata)
- Per content output: ~10KB × 4 types = 40KB
- Total per transcript: ~100KB

**Projections**:
| Users | Transcripts | Est. DB Size |
|-------|-------------|--------------|
| 100 | 500 | ~50MB |
| 500 | 5,000 | ~500MB |
| 1,000 | 15,000 | ~1.5GB |
| 5,000 | 100,000 | ~10GB |
| 10,000 | 300,000 | ~30GB |

### Supabase Scaling Limits

| Metric | Free | Pro | Concern |
|--------|------|-----|---------|
| DB Connections | 60 | 60 (Micro) | 🟡 May need pooler |
| API Rate Limits | Shared | Shared | Monitor in production |
| Realtime Connections | 200 | 500 | Not using realtime |

### Supabase Cost Projection

| Users | Est. DB Size | Est. Supabase Cost |
|-------|--------------|-------------------|
| 100 | 50MB | $25 (Pro base) |
| 500 | 500MB | $25 |
| 1,000 | 1.5GB | $25 |
| 5,000 | 10GB | $25 + ~$0.25 = $25.25 |
| 10,000 | 30GB | $25 + ~$2.75 = $27.75 |

**Verdict**: Supabase Pro is extremely cost-effective. Database costs stay low.

---

## Combined Cost Projections

### Monthly Infrastructure Cost

| Stage | Users | Vercel | Supabase | Total Infra |
|-------|-------|--------|----------|-------------|
| Launch | 100 | $20 | $25 | **$45/mo** |
| Growth | 500 | $30 | $25 | **$55/mo** |
| Scale | 1,000 | $50 | $25 | **$75/mo** |
| Expand | 5,000 | $150 | $30 | **$180/mo** |
| Mature | 10,000 | $300 | $50 | **$350/mo** |

### Revenue vs. Cost Analysis

Assuming average revenue per user (ARPU) of $50/mo:

| Users | MRR | Infra Cost | Infra % of Revenue |
|-------|-----|------------|-------------------|
| 100 | $5,000 | $45 | 0.9% ✅ |
| 500 | $25,000 | $55 | 0.2% ✅ |
| 1,000 | $50,000 | $75 | 0.15% ✅ |
| 5,000 | $250,000 | $180 | 0.07% ✅ |

**Verdict**: Infrastructure costs are negligible relative to revenue.

---

## Potential Bottlenecks

### 1. Supabase Connection Limits
**Risk**: Medium at scale
**Solution**: Use connection pooler (PgBouncer) - built into Supabase
**When**: If you see connection errors at 50+ concurrent users

### 2. Vercel Cold Starts
**Risk**: Low
**Impact**: First request after idle may be 1-2s slower
**Solution**: Keep functions warm with cron ping (you already have cron)

### 3. Claude API Costs (Not Vercel/Supabase)
**Risk**: This is your real cost center
**Estimate**: $0.50-2.00 per transcript (depending on length)
**At 1,000 users**: Could be $2,500-10,000/mo in Claude costs

### 4. Database Size
**Risk**: Low with Pro plan
**When to worry**: 30GB+ (around 10K+ users with heavy usage)
**Solution**: Upgrade compute tier or archive old data

---

## Alternatives Considered

### If Vercel Becomes Too Expensive

| Alternative | Pros | Cons |
|-------------|------|------|
| Railway | Similar DX, flat pricing | Less edge network |
| Render | Cheaper compute | Slower deploys |
| Self-hosted (AWS/DO) | Full control, cheaper | Much more work |

**Recommendation**: Stick with Vercel until $500+/mo, then evaluate.

### If Supabase Becomes Too Expensive

| Alternative | Pros | Cons |
|-------------|------|------|
| PlanetScale | MySQL, great scaling | Different syntax |
| Neon | Postgres, serverless | Newer, less battle-tested |
| Self-hosted Postgres | Cheapest at scale | DevOps burden |

**Recommendation**: Supabase Pro is cheap enough that migration isn't worth it until 50K+ users.

---

## Recommendations

### Immediate Actions

1. **Upgrade Supabase to Pro ($25/mo)** ⚠️
   - Prevents project pausing
   - Gets you 8GB database
   - Essential before launch

2. **Set up connection pooling**
   - Use Supabase's built-in PgBouncer
   - Change connection string to pooler URL

3. **Add monitoring**
   - Vercel: Check function duration/invocations
   - Supabase: Check database size and connections

### Before 1,000 Users

1. Monitor Claude API costs (this will be your biggest expense)
2. Consider caching common operations
3. Set up database backups (Supabase Pro includes 7-day backups)

### Before 10,000 Users

1. Evaluate if Vercel Enterprise features are needed
2. Consider Supabase compute upgrade if seeing slowdowns
3. Implement data archival strategy for old transcripts

---

## Final Verdict

**Vercel + Supabase Pro is the right choice for Voxify.**

✅ Scales to 10K+ users without major changes
✅ Infrastructure costs stay under 1% of revenue
✅ No DevOps burden - focus on product
✅ Easy to migrate later if needed (but probably won't need to)

**Only change needed**: Upgrade Supabase Free → Pro ($25/mo) before launch.

Your real cost concern is **Claude API**, not infrastructure. At scale, Claude will be 10-50x your Vercel/Supabase costs combined.

---

*Research completed: February 2026*
