# Kalshi Oracle: Complete System Architecture

**Version:** 2.0  
**Author:** Earl (AI Trading Assistant)  
**Date:** February 14, 2026

---

## Executive Summary

Kalshi Oracle is an autonomous prediction market trading system that identifies mispriced contracts on Kalshi.com, performs deep research to verify edge, and executes trades based on predefined risk parameters. The system uses Python for efficient market scanning and data processing, with AI (Claude via OpenClaw) handling research, analysis, and trade decisions only when actionable opportunities arise.

---

## Trading Criteria (Hard Rules)

### Position Requirements

| Parameter | Value | Non-Negotiable |
|-----------|-------|----------------|
| Position size | $50-75 | ✅ |
| Minimum market volume | $5,000 | ✅ |
| Maximum resolution time | 12 months | ✅ |
| Preferred resolution | 1-6 months | Preferred |

### Edge Thresholds

| Edge | Action |
|------|--------|
| >10% | Auto-execute (no approval needed) |
| 5-10% | Ask Drew for approval via Telegram |
| <5% | Skip (not worth the risk) |

### Research Requirements (Mandatory Before ANY Trade)

1. **Fresh web search** - Verify current facts, never rely on model memory
2. **Recent news check** - Last 24-48 hours of relevant headlines
3. **Twitter/social scan** - Real-time sentiment from key figures
4. **Base rate analysis** - Historical frequency of similar events
5. **Contrarian check** - Why is the market pricing it this way?

⚠️ **No trade executes without completing all 5 research steps.**

---

## System Architecture

### Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| Market Scanner | Python 3.11 | Fetches markets, pre-filters, detects opportunities |
| Trading Client | Python + RSA Auth | Executes authenticated trades on Kalshi |
| AI Decision Engine | OpenClaw (Claude) | Deep research + trade decisions (alert-only) |
| Scheduling | System cron + OpenClaw | Triggers scans and analysis |
| News Monitoring | Bird CLI + Brave API | Real-time event detection |
| Data Storage | JSON files | Trade logs, watchlist, learnings |

### File Structure

```
kalshi-oracle/
├── kalshi_oracle/
│   ├── __init__.py
│   ├── client.py              # RSA-authenticated Kalshi API client
│   └── scanner.py             # Market scanning and pre-filtering
├── scripts/
│   ├── list_markets.py        # List all available markets
│   ├── scan_opportunities.py  # Find and pre-filter opportunities
│   ├── check_positions.py     # Monitor position movements
│   └── alert_earl.py          # Wake AI only when needed
├── data/
│   ├── watchlist.json         # Queued opportunities for review
│   └── trades/
│       ├── trade_log.json     # All executed trades with reasoning
│       └── learnings.md       # Post-trade analysis and lessons
├── .env                       # API credentials (not in git)
└── requirements.txt
```

---

## How It Works: Optimized Flow

### Design Principle: Python Scans, AI Decides

**Old approach:** AI runs every 15 minutes, burning tokens even when nothing happens.

**New approach:** Python runs lightweight scans via system cron. AI is only woken when:
- Position moves >5%
- Opportunity passes all pre-filters
- Error requires human-level judgment

This reduces costs by ~80%.

### Phase 1: Continuous Monitoring (Python, Every 15 Minutes)

```
┌─────────────────────────────────────────────────────────────────┐
│              SYSTEM CRON TRIGGERS PYTHON SCRIPT                 │
│                    (Every 15 minutes)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PYTHON: CHECK POSITIONS                        │
│                                                                 │
│  For each open position:                                        │
│  • Fetch current price from Kalshi API                         │
│  • Compare to entry price                                       │
│  • If moved >5% → flag for alert                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PYTHON: SCAN MARKETS                           │
│                                                                 │
│  Pre-filter (reject before AI sees it):                        │
│  • Volume < $5,000 → SKIP                                      │
│  • Resolution > 12 months → SKIP                               │
│  • Price < 5¢ or > 95¢ → SKIP (low edge potential)            │
│  • Already in watchlist → SKIP                                 │
│                                                                 │
│  Passed filters? → Add to watchlist.json                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DECISION GATE                               │
│                                                                 │
│  Alert needed?                                                  │
│  • Position alert triggered? → Wake Earl                       │
│  • New watchlist item added? → Log for trade window            │
│  • Nothing significant? → Exit silently (no AI cost)           │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: Trade Window (AI, Every 6 Hours)

```
┌─────────────────────────────────────────────────────────────────┐
│                OPENCLAW CRON TRIGGERS                           │
│           (Every 6 hours: 2am, 8am, 2pm, 8pm MT)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│             EARL: REVIEW WATCHLIST                              │
│                                                                 │
│  Load watchlist.json                                            │
│  For each candidate:                                            │
│  • Is it still available at attractive price?                  │
│  • Does it still meet all criteria?                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│          EARL: DEEP RESEARCH (Per Candidate)                    │
│                                                                 │
│  1. Web search for current facts (Brave API)                   │
│  2. Check recent news (last 24-48 hours)                       │
│  3. Twitter scan for real-time sentiment                       │
│  4. Base rate analysis - historical frequency                  │
│  5. Contrarian check - why does market disagree?               │
│                                                                 │
│  Calculate: My probability estimate vs market price            │
│  Edge = (My Prob - Market Price) / Market Price                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DECISION & EXECUTION                          │
│                                                                 │
│  Edge >10%:                                                     │
│  → Execute trade automatically                                  │
│  → Log to trade_log.json                                       │
│  → Notify Drew via Telegram                                    │
│                                                                 │
│  Edge 5-10%:                                                    │
│  → Send approval request to Drew                               │
│  → Wait for YES/NO response                                    │
│  → Execute if approved                                          │
│                                                                 │
│  Edge <5%:                                                      │
│  → Remove from watchlist                                        │
│  → No action                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cron Job Specifications

### Job 1: Position & Market Scan (Python via System Cron)

| Field | Value |
|-------|-------|
| **Schedule** | */15 * * * * (every 15 minutes) |
| **Executor** | System crontab (not OpenClaw) |
| **Script** | `python scripts/scan_opportunities.py` |
| **AI Involvement** | None (unless alert triggered) |
| **Cost** | ~$0 (Python only) |

**What it does:**
- Checks all open positions for >5% movement
- Scans markets with pre-filters
- Updates watchlist.json
- Only wakes Earl if alert needed

### Job 2: Trade Analysis Window (OpenClaw Cron)

| Field | Value |
|-------|-------|
| **Schedule** | Every 6 hours (2am, 8am, 2pm, 8pm MT) |
| **Type** | systemEvent (main session) |
| **Model** | Sonnet for initial review, Opus for trade decisions |
| **Cost** | ~$0.30-0.50 per run |
| **Monthly Cost** | ~$40-60 |

**Trigger Message:**
```
Kalshi trade window. Review watchlist.json for opportunities.
For each candidate: verify still valid, do deep research (web search, 
Twitter, base rates), calculate edge. Execute if >10% edge, 
ask me if 5-10% edge, remove if <5%.
```

### Job 3: Daily Briefing (OpenClaw Cron)

| Field | Value |
|-------|-------|
| **Schedule** | 8:00 AM Mountain Time |
| **Type** | systemEvent (main session) |
| **Model** | Sonnet |
| **Cost** | ~$0.15 per run |
| **Monthly Cost** | ~$4.50 |

**Trigger Message:**
```
Kalshi morning briefing. Report:
1. Current positions with entry price and current price
2. P&L summary (unrealized)
3. Any positions approaching resolution
4. Top 3 watchlist candidates
Keep it brief.
```

### Job 4: Weekly Review (OpenClaw Cron)

| Field | Value |
|-------|-------|
| **Schedule** | Sunday 10:00 AM Mountain Time |
| **Type** | systemEvent (main session) |
| **Model** | Opus (needs deep analysis) |
| **Cost** | ~$0.50 per run |
| **Monthly Cost** | ~$2 |

**Trigger Message:**
```
Weekly Kalshi review. Analyze:
1. Trades executed this week
2. Win/loss record and P&L
3. Calibration: predicted probability vs actual outcome
4. What worked, what didn't
5. Strategy adjustments for next week
Update learnings.md with insights.
```

---

## Data Structures

### watchlist.json

```json
{
  "updated": "2026-02-14T03:00:00Z",
  "candidates": [
    {
      "ticker": "KXSOMEEVENT-26MAY",
      "title": "Will X happen by May 2026?",
      "current_price": 0.23,
      "volume": 15420,
      "resolution_date": "2026-05-01",
      "added": "2026-02-14T02:45:00Z",
      "notes": "Passed pre-filters, awaiting deep research"
    }
  ]
}
```

### trade_log.json

```json
{
  "trades": [
    {
      "id": "trade_001",
      "timestamp": "2026-02-14T02:30:00Z",
      "market": "KXZELENSKYPUTIN-29-26JUL",
      "title": "Zelenskyy and Putin meet by Jul 1, 2026",
      "side": "YES",
      "contracts": 315,
      "entry_price": 0.19,
      "cost": 59.85,
      "edge_estimate": 0.58,
      "my_probability": 0.30,
      "market_probability": 0.19,
      "thesis": "Diplomatic pressure mounting, multiple back-channels active",
      "research_completed": {
        "web_search": true,
        "twitter_scan": true,
        "base_rate_analysis": true,
        "contrarian_check": true
      },
      "key_evidence": [
        "Swiss mediation ongoing since Jan 2026",
        "Trump administration pushing for summit",
        "Both sides showing flexibility on preconditions"
      ],
      "what_changes_my_mind": [
        "Major military escalation",
        "Either leader publicly refuses talks",
        "Key mediator withdraws"
      ],
      "current_price": null,
      "exit_price": null,
      "outcome": null,
      "resolved": false,
      "resolution_date": "2026-07-01"
    }
  ]
}
```

### learnings.md

```markdown
# Kalshi Oracle: Lessons Learned

## Critical Lessons

### 1. Always Verify with Fresh Web Search
Near-miss on Musk/DOGE bet - almost traded on stale model knowledge.
Model training data can be months old. ALWAYS web search first.

### 2. Volume Matters
Low-volume markets (<$5K) are traps - hard to exit, wide spreads.

### 3. Extreme Prices = Low Edge
Markets at 5¢ or 95¢ rarely have real edge - the obvious bet is priced in.

## Trade Reviews

### Trade 001: Zelenskyy/Putin Meeting (OPEN)
- Entry: 19¢ YES on 2026-02-14
- Thesis: Market underpricing diplomatic momentum
- Status: Monitoring
- Lessons: TBD after resolution
```

---

## Cost Analysis (Optimized)

### Monthly Operating Costs

| Component | How | Cost/Run | Runs/Month | Monthly Total |
|-----------|-----|----------|------------|---------------|
| 15-min scan | Python (no AI) | $0 | 2,880 | $0 |
| Position alerts | AI on-demand | $0.10 | ~10 | $1 |
| Trade windows | Sonnet + Opus | $0.40 | 120 | $48 |
| Daily briefing | Sonnet | $0.15 | 30 | $4.50 |
| Weekly review | Opus | $0.50 | 4 | $2 |
| **Total** | | | | **~$55/month** |

### Break-Even Analysis

| Capital | Annual Return (20%) | Monthly Profit | System Cost | Net |
|---------|---------------------|----------------|-------------|-----|
| $670 | $134 | $11 | $55 | -$44 |
| $2,000 | $400 | $33 | $55 | -$22 |
| $3,500 | $700 | $58 | $55 | +$3 |
| $5,000 | $1,000 | $83 | $55 | +$28 |
| $10,000 | $2,000 | $167 | $55 | +$112 |

**Break-even: ~$3,500 capital at 20% annual returns**

---

## Risk Management

### Hard Limits

| Rule | Limit | Enforced By |
|------|-------|-------------|
| Max position size | $75 | Python pre-check |
| Min position size | $50 | Python pre-check |
| Max total positions | 10 | Python pre-check |
| Max single-market exposure | 15% of capital | Earl review |
| Max resolution time | 12 months | Python pre-filter |
| Min volume | $5,000 | Python pre-filter |
| Research requirement | All 5 steps | Earl checklist |

### Position Sizing (Future: Kelly Criterion)

Current: Flat $50-75 per position

Future enhancement: Size based on edge and confidence
```
Kelly % = (Edge × Confidence) / Odds
Position = Kelly % × Bankroll × 0.25 (quarter-Kelly for safety)
```

### Correlation Awareness (Future)

Don't overexpose to correlated events:
```json
{
  "correlation_groups": {
    "ukraine_conflict": ["KXZELENSKYPUTIN", "KXUKRAINECEASEFIRE", "KXRUSSIAWAR"],
    "us_politics": ["KXTRUMP2028", "KXBIDEN2028", "KXIMPEACHMENT"]
  },
  "max_per_group": 2
}
```

---

## Communication Protocol

### Alert Levels

| Level | Trigger | Action |
|-------|---------|--------|
| 🟢 Silent | Scan complete, nothing found | No message (Python exits) |
| 🟡 Log | New watchlist candidate | Write to watchlist.json |
| 🟠 Ask | 5-10% edge opportunity | Telegram Drew for approval |
| 🔴 Notify | Trade executed or position alert | Telegram notification |
| 🚨 Urgent | Account issue, API failure, >10% position move | Immediate Telegram |

### Message Templates

**Position Alert:**
```
🔴 Kalshi Position Alert

KXZELENSKYPUTIN-29-26JUL moved significantly
Entry: 19¢ → Current: 25¢ (+32%)

Check news for catalyst?
```

**Trade Approval Request:**
```
🟠 Kalshi Trade Opportunity

Market: [TITLE]
Current: [X]¢ [YES/NO]
My estimate: [Y]%
Edge: [Z]% (5-10% range)

Research completed:
✅ Web search
✅ Twitter scan
✅ Base rate analysis
✅ Contrarian check

Thesis: [Brief reasoning]

Position: $[AMOUNT] for [N] contracts

Reply YES to approve, NO to skip.
```

**Trade Executed:**
```
✅ Kalshi Trade Executed

Market: [TITLE]
Side: [YES/NO] @ [X]¢
Contracts: [N]
Cost: $[AMOUNT]
Edge: [Z]%

Thesis: [One sentence]
```

---

## Authentication

### RSA Key Signing (Required for Trading)

```
┌─────────────────────────────────────────────────────────────────┐
│                   REQUEST SIGNING FLOW                          │
│                                                                 │
│  1. Create timestamp (milliseconds since epoch)                │
│  2. Build message: timestamp + method + path + body            │
│  3. Sign with RSA private key (PKCS1v15 + SHA256)             │
│  4. Base64 encode signature                                    │
│  5. Add headers to request                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Credentials:**
- Private key: `~/.kalshi/private_key.pem`
- API Key ID: `KALSHI_API_KEY` in `.env`
- Key ID: `1e62a891...`

---

## Recovery Procedures

### Python Scan Fails
1. Check Kalshi API status (status.kalshi.com)
2. Verify `.env` credentials exist
3. Test: `python -c "from kalshi_oracle.client import KalshiClient; print(KalshiClient().get_balance())"`
4. Check logs in `/tmp/kalshi-scan.log`
5. If persistent >1 hour: alert Drew

### Trade Execution Fails
1. Log full error to trade_log.json
2. Do NOT retry automatically (avoid double-orders)
3. Check Kalshi for partial fills
4. Alert Drew immediately
5. Manual review before retry

### API Rate Limited
1. Exponential backoff (Python handles)
2. Temporarily increase scan interval
3. Alert if >1 hour

---

## Quick Reference Commands

```bash
# Check balance
cd ~/kalshi-oracle
python -c "from kalshi_oracle.client import KalshiClient; c = KalshiClient(); print(c.get_balance())"

# List positions
python -c "from kalshi_oracle.client import KalshiClient; c = KalshiClient(); print(c.get_positions())"

# Manual scan
python scripts/scan_opportunities.py

# View watchlist
cat data/watchlist.json | python -m json.tool

# View trade log
cat data/trades/trade_log.json | python -m json.tool

# View learnings
cat data/trades/learnings.md
```

---

## Implementation Status

| Component | Status |
|-----------|--------|
| Kalshi API client (RSA auth) | ✅ Complete |
| Basic market scanner | ✅ Complete |
| Trade execution | ✅ Complete |
| Trade logging | ✅ Complete |
| Position monitoring | ✅ Complete |
| Pre-filtering (Python) | 🔄 In progress |
| Watchlist persistence | 🔄 In progress |
| System cron (Python scans) | ⏳ Pending |
| Sonnet sub-agent integration | ⏳ Pending |
| Kelly position sizing | ⏳ Future |
| Correlation tracking | ⏳ Future |

---

## GitHub Repository

**URL:** https://github.com/EarlAiAssistant/kalshi-oracle

**Branches:**
- `main` - Production code
- `develop` - Active development

---

*Document generated by Earl for Drew Kubacki*  
*Version 2.0 - February 14, 2026*
