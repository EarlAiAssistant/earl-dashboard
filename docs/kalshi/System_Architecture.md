# Kalshi Oracle: System Architecture

**Version:** 3.0 (4 Levers + Self-Improvement)  
**Author:** Earl (AI Trading Assistant)  
**Date:** February 14, 2026  
**Status:** ✅ LIVE & VERIFIED

---

## The 4 Key Levers

### Lever 1: Edge Quality
- **Requirement:** Only bet with 10%+ genuine edge
- **Enforcement:** AI trade windows verify edge with fresh research
- **Tracking:** edge_claimed vs edge_realized in trade_log.json

### Lever 2: Resolution Speed  
- **Preferred:** 1-6 months (faster compounding)
- **Absolute Max:** 12 months
- **Enforcement:** Python scanner prioritizes in_preferred_window markets
- **Goal:** 3-4x capital turnover per year

### Lever 3: Capital Deployment
- **Target:** 70% of capital deployed
- **Minimum:** 50% (alert if below)
- **Enforcement:** Python scanner (every 5 min) tracks capital_tracking.json
- **Alert:** Notify if underdeployed

### Lever 4: Win Rate / Calibration
- **Tracking:** Every trade logged with predicted vs actual
- **Metrics:** Win rate, Brier score, edge claimed vs realized
- **Review:** Weekly self-improvement loop
- **Goal:** Continuous calibration improvement

---

## Expected Returns (With 4 Levers)

| Capital | Edge | Turnover | Annual Profit | Monthly | After Costs |
|---------|------|----------|---------------|---------|-------------|
| $5,000 | 15% | 3x/year | $2,250 | $188 | $103 |
| $10,000 | 15% | 3x/year | $4,500 | $375 | $290 |
| $25,000 | 15% | 4x/year | $15,000 | $1,250 | $1,165 |
| $50,000 | 15% | 4x/year | $30,000 | $2,500 | $2,415 |

**Break-even:** ~$2,500 capital (with efficient execution)

---

## Current Status

### Account
| Metric | Value |
|--------|-------|
| Total Capital | ~$677 |
| Deployed | ~$69 (10%) |
| Available | ~$608 |

### Active Positions
| Market | Entry | Current | Days Left | Edge Claimed |
|--------|-------|---------|-----------|--------------|
| Zelenskyy/Putin | 19¢ | 17¢ | 137 | 58% |
| Hockey SVK (manual) | 22¢ | 16¢ | 0 | N/A |

### Lever Performance
| Lever | Target | Current |
|-------|--------|---------|
| Edge Quality | ≥10% | 58% ✅ |
| Resolution | 1-6mo | 137 days ✅ |
| Deployment | 70% | 10% ⚠️ |
| Win Rate | ≥60% | TBD |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              SYSTEM CRON (Every 5 min) - Python                 │
│                         Cost: $0                                │
├─────────────────────────────────────────────────────────────────┤
│  • Check positions for movement (Lever 4)                      │
│  • Track capital deployment (Lever 3)                          │
│  • Scan markets with priority scoring (Levers 1, 2)            │
│  • Write alerts to pending_alerts.json                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              OPENCLAW CRON (Every 5 min) - Sonnet               │
│                    Alert Checker                                │
├─────────────────────────────────────────────────────────────────┤
│  • Read pending_alerts.json                                     │
│  • Send alerts to Drew via Telegram                            │
│  • Clear file after sending                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              OPENCLAW CRON (Every 6 hours) - Opus               │
│                    Trade Window                                 │
├─────────────────────────────────────────────────────────────────┤
│  • Review watchlist (prioritized by Lever 2)                   │
│  • Deep research on candidates                                  │
│  • Calculate edge (Lever 1: must be ≥10%)                      │
│  • Check deployment % (Lever 3)                                │
│  • Log decision with prediction (Lever 4)                      │
│  • Execute or ask Drew                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            OPENCLAW CRON (Weekly) - Self-Improvement            │
│                    Sunday 10am MT                               │
├─────────────────────────────────────────────────────────────────┤
│  • Calibration check (predicted vs actual)                     │
│  • Lever performance analysis                                   │
│  • Pattern recognition                                          │
│  • Strategy adjustments                                         │
│  • Update learnings.md                                          │
│  • Weekly report to Drew                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Structures

### watchlist.json
```json
{
  "candidates": [
    {
      "ticker": "...",
      "priority_score": 45,
      "in_preferred_window": true,
      "days_to_resolution": 90
    }
  ],
  "stats": {
    "in_preferred_window": 3,
    "avg_priority": 32
  }
}
```

### trade_log.json
```json
{
  "trades": [
    {
      "predicted_probability": 0.30,
      "market_probability": 0.19,
      "edge_claimed": 0.58,
      "actual_outcome": null,
      "edge_realized": null
    }
  ],
  "calibration": {
    "win_rate": null,
    "avg_edge_claimed": 0.58,
    "avg_edge_realized": null,
    "brier_score": null
  }
}
```

### capital_tracking.json
```json
{
  "current": {
    "total": 677,
    "deployed": 69,
    "deployment_pct": 10
  }
}
```

---

## Decision Matrix

| Edge | Resolution | Capital | Action |
|------|------------|---------|--------|
| ≥10% | 1-6 months | <70% deployed | Auto-execute |
| ≥10% | 1-6 months | ≥70% deployed | Ask Drew |
| ≥10% | 6-12 months | Any | Ask Drew |
| 5-10% | Any | Any | Ask Drew with research |
| <5% | Any | Any | Remove from watchlist |

---

## Position Sizing

| Capital | Bet Size | Max Positions |
|---------|----------|---------------|
| $677 | $50-75 | 8-10 |
| $2,500 | $150-200 | 10-12 |
| $5,000 | $300-400 | 12-15 |
| $10,000 | $500-750 | 12-15 |
| $25,000 | $1,000-1,500 | 15-20 |

---

## Monthly Costs

| Component | Cost |
|-----------|------|
| Python scanner | $0 |
| Alert checker (5 min) | ~$22 |
| Trade windows (6h, Opus) | ~$48 |
| Daily briefing | ~$4.50 |
| Weekly review (Opus) | ~$2 |
| Health check | ~$9 |
| **Total** | **~$85/month** |

---

## Self-Improvement Loop

```
Week N:
┌─────────────────────────────────────────────────────────────────┐
│  1. Make predictions (trade_log.json)                          │
│  2. Track outcomes as they resolve                             │
│  3. Compare predicted vs actual (calibration)                  │
│  4. Identify patterns (what works, what doesn't)               │
│  5. Adjust thresholds/strategy (learnings.md)                  │
│  6. Apply to Week N+1                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Calibration Targets
| Metric | Target |
|--------|--------|
| Win Rate | ≥60% |
| Brier Score | <0.20 |
| Edge Realized / Edge Claimed | ≥0.7 |
| Capital Turnover | 3-4x/year |

---

## Quick Commands

```bash
# Run scanner manually
python3 ~/kalshi-oracle/scripts/cron_scan.py --verbose

# Check capital deployment
cat ~/kalshi-oracle/data/capital_tracking.json

# Check watchlist
cat ~/kalshi-oracle/data/watchlist.json | python3 -m json.tool

# Check trade log
cat ~/kalshi-oracle/data/trades/trade_log.json | python3 -m json.tool

# View learnings
cat ~/kalshi-oracle/data/trades/learnings.md
```

---

## GitHub
https://github.com/EarlAiAssistant/kalshi-oracle

---

*Last updated: February 14, 2026 4:05am MT*
