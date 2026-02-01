# Voxify Monthly Expenses

*Updated: February 2026*

---

## Current Monthly Costs

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| Claude Code Max | Subscription | ~$100/mo | Development tool |
| Anthropic API | Pay-as-you-go | Variable | Sonnet 4 for content generation |
| Vercel | Pro | $20/mo | Hosting + 60s function timeout |
| Supabase | **Pro** | $25/mo | Database (upgrade before launch!) |
| Domains | getvoxify.com + voxify.run | ~$25/yr | One-time, renews annually |
| Midjourney | Subscription | ~$10-30/mo | Design assets |

---

## Estimated Monthly Total

**Fixed costs**: ~$155-185/mo

**Variable (API usage)**:
- Sonnet 4: ~$0.30 per transcript (measured)
- At 100 paying users (avg 5 transcripts each): ~$150/mo
- At 1,000 paying users: ~$1,500/mo

---

## Cost Per Transcript Breakdown

Using Claude Sonnet 4 (claude-sonnet-4-20250514):
- Input: $3/1M tokens
- Output: $15/1M tokens

**Actual measured cost**: ~$0.30 per transcript (based on 20-min call transcript)

At $29/mo for 10 transcripts:
- Revenue: $29/user/mo
- API cost: $3/user/mo
- **Margin: ~90%** ✅

---

## Future Costs (When Implemented)

| Service | Purpose | Est. Cost |
|---------|---------|-----------|
| Resend | Transactional email | Free tier → $20/mo |
| AssemblyAI | Audio transcription (if added) | $0.37/min |
| Stripe | Payment processing | 2.9% + $0.30/transaction |
| PostHog | Analytics | Free tier (1M events) |

---

## Break-Even Analysis

**Fixed costs**: ~$175/mo

**To break even** (assuming $50 ARPU, 55% margin after API):
- Need: $175 ÷ ($50 × 0.55) = **~6-7 paying customers**

---

*Keep this updated as costs change*
