# Kalshi Oracle: System Architecture

**Version:** 2.1 (Implemented)  
**Author:** Earl (AI Trading Assistant)  
**Date:** February 14, 2026  
**Status:** ✅ LIVE

---

## Executive Summary

Kalshi Oracle is an autonomous prediction market trading system that identifies mispriced contracts on Kalshi.com, performs deep research to verify edge, and executes trades based on predefined risk parameters. 

The system uses a **hybrid architecture**:
- **Python** handles fast, frequent scanning (every 15 min) at zero AI cost
- **AI (Claude)** handles deep research and trade decisions (every 6 hours)

---

## Current Status

### Account Balance
- **Available:** ~$608
- **Invested:** ~$69
- **Total:** ~$677

### Active Positions

| Market | Side | Contracts | Entry | Current | P&L |
|--------|------|-----------|-------|---------|-----|
| Zelenskyy/Putin meet by Jul 2026 | YES | 315 | 19¢ | 17¢ | -10.5% |
| Women's Hockey SVK (manual) | YES | 42 | 22¢ | 16¢ | -27.6% |

### System Health
- **Python Cron:** ✅ Running (system crontab, every 15 min)
- **AI Trade Windows:** ✅ Enabled (every 6 hours)
- **Daily Briefing:** ✅ Enabled (8am MT)
- **Weekly Review:** ✅ Enabled (Sunday 10am MT)

---

## Trading Rules (Hardcoded)

### Position Sizing
| Parameter | Value |
|-----------|-------|
| Position size | $50-75 |
| Min market volume | $5,000 |
| Max resolution time | 12 months |
| Max positions | 10 |

### Edge Thresholds
| Edge | Action |
|------|--------|
| >10% | Auto-execute (notify Drew after) |
| 5-10% | Ask Drew for approval |
| <5% | Skip |

### Pre-Filters (Python enforces these)
- Volume < $5K → Reject
- Resolution > 365 days → Reject
- Price < 5¢ or > 95¢ → Reject
- No bid/ask spread → Reject
- Sports/Entertainment → Skip

### Research Protocol (Mandatory)
Before ANY trade:
1. ✅ Fresh web search (verify current facts)
2. ✅ Recent news check (last 24-48h)
3. ✅ Base rate analysis
4. ✅ Contrarian check (why does market disagree?)

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SYSTEM CRON (Every 15 min)                  │
│                        Python Scanner                           │
│                          Cost: $0                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Check positions for >5% movement                           │
│  2. Quick scan top 50 Politics/Economics/Elections events      │
│  3. Update watchlist.json with candidates                      │
│  4. Alert OpenClaw ONLY if significant finding                 │
└─────────────────────────────────────────────────────────────────┘
                              │
            (alert only if needed)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  OPENCLAW CRON (Every 6 hours)                  │
│                    AI Trade Windows                             │
│                     Cost: ~$0.40/run                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Review watchlist.json candidates                           │
│  2. Deep research on each (web search, news, base rates)       │
│  3. Calculate edge vs market price                             │
│  4. Execute if >10% edge, ask Drew if 5-10%                    │
│  5. Log decision to trade_log.json                             │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
kalshi-oracle/
├── kalshi_oracle/
│   ├── __init__.py
│   ├── client.py              # RSA-authenticated Kalshi API
│   └── scanner.py             # Market scanning utilities
├── scripts/
│   ├── cron_scan.py           # Python cron scanner (MAIN)
│   ├── run_cron.sh            # Wrapper for system cron
│   ├── list_markets.py        # Manual market listing
│   └── scan_opportunities.py  # Manual opportunity scan
├── data/
│   ├── watchlist.json         # Candidates awaiting review
│   ├── positions_cache.json   # Entry prices for P&L tracking
│   └── trades/
│       ├── trade_log.json     # All trades with reasoning
│       └── learnings.md       # Post-trade lessons
├── .env                       # Credentials (not in git)
└── requirements.txt
```

---

## Cron Jobs

### 1. Python Scanner (System Cron)

| Field | Value |
|-------|-------|
| Schedule | `*/15 * * * *` (every 15 min) |
| Executor | System crontab |
| Script | `/home/ubuntu/.openclaw/workspace/kalshi-oracle/scripts/run_cron.sh` |
| AI Cost | $0 |

**What it does:**
- Fetches current positions, calculates P&L vs entry
- Quick scan of top 50 priority events
- Updates watchlist.json with passing candidates
- Alerts OpenClaw only if position moves >5% or high-volume opportunity found

### 2. Trade Window (OpenClaw Cron)

| Field | Value |
|-------|-------|
| Schedule | Every 6 hours (2am, 8am, 2pm, 8pm MT) |
| Type | systemEvent (main session) |
| AI Cost | ~$0.40/run |
| Monthly Cost | ~$48 |

**What it does:**
- Reviews watchlist.json candidates
- Deep research on each (web search, news)
- Calculates edge, makes trade decisions
- Executes or asks Drew for approval

### 3. Daily Briefing (OpenClaw Cron)

| Field | Value |
|-------|-------|
| Schedule | 8:00 AM Mountain Time |
| Type | isolated session |
| Model | Sonnet |
| Monthly Cost | ~$4.50 |

**What it does:**
- Portfolio status report
- P&L summary
- Overnight news scan
- Sends summary to Drew via Telegram

### 4. Weekly Review (OpenClaw Cron)

| Field | Value |
|-------|-------|
| Schedule | Sunday 10:00 AM Mountain Time |
| Type | main session |
| Model | Opus |
| Monthly Cost | ~$2 |

**What it does:**
- Performance analysis (wins/losses)
- Calibration check (predicted vs actual)
- Strategy adjustments
- Updates learnings.md

---

## Cost Analysis

### Monthly Operating Costs

| Component | Frequency | Cost/Run | Monthly |
|-----------|-----------|----------|---------|
| Python scanner | 96/day | $0 | $0 |
| Trade windows | 4/day | $0.40 | $48 |
| Daily briefing | 1/day | $0.15 | $4.50 |
| Weekly review | 4/month | $0.50 | $2 |
| Health check | 6/day | $0.05 | $9 |
| **Total** | | | **~$63/month** |

### Break-Even Analysis

| Capital | Annual Return (20%) | Monthly Profit | System Cost | Net |
|---------|---------------------|----------------|-------------|-----|
| $677 (current) | $135 | $11 | $63 | -$52 |
| $2,000 | $400 | $33 | $63 | -$30 |
| $4,000 | $800 | $67 | $63 | +$4 |
| $5,000 | $1,000 | $83 | $63 | +$20 |
| $10,000 | $2,000 | $167 | $63 | +$104 |

**Break-even: ~$4,000 capital at 20% annual returns**

---

## Data Structures

### watchlist.json

```json
{
  "updated": "2026-02-14T03:38:24Z",
  "candidates": [
    {
      "ticker": "KXTAIWANLVL4-27JAN01",
      "title": "US Level 4 warning for Taiwan before Jan 2027?",
      "category": "Politics",
      "current_price": 23.5,
      "volume": 72912,
      "days_to_resolution": 321,
      "status": "pending_review"
    }
  ]
}
```

### positions_cache.json

```json
{
  "updated": "2026-02-14T03:38:58Z",
  "positions": {
    "KXZELENSKYPUTIN-29-26JUL": {
      "entry_price": 19.0,
      "last_price": 17,
      "contracts": 315
    }
  }
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
      "side": "YES",
      "contracts": 315,
      "entry_price": 19,
      "cost": 59.85,
      "edge_estimate": 58,
      "thesis": "Diplomatic momentum underestimated",
      "research_completed": true,
      "resolved": false
    }
  ]
}
```

---

## Authentication

### Kalshi RSA Signing
- **Private Key:** `~/.kalshi/private_key.pem`
- **API Key ID:** `1e62a891...`
- **Method:** PKCS1v15 + SHA256

```
Signature = Base64(RSA_Sign(timestamp + method + path + body))
```

---

## Alert Levels

| Level | Trigger | Action |
|-------|---------|--------|
| 🟢 Silent | Scan complete, nothing found | Python exits quietly |
| 🟡 Log | New candidate added | Update watchlist.json |
| 🟠 Ask | 5-10% edge found | Telegram Drew for approval |
| 🔴 Notify | Trade executed | Telegram notification |
| 🚨 Urgent | Position >5% move or API error | Immediate Telegram |

---

## Quick Commands

```bash
# Check balance
cd ~/kalshi-oracle
python3 -c "from kalshi_oracle.client import KalshiClient; print(KalshiClient().get_balance())"

# List positions
python3 -c "from kalshi_oracle.client import KalshiClient; print(KalshiClient().get_positions())"

# Manual scan
python3 scripts/cron_scan.py --verbose

# View watchlist
cat data/watchlist.json | python3 -m json.tool

# View cron log
tail -50 /tmp/kalshi-cron.log

# Check system cron
crontab -l
```

---

## GitHub Repository

**URL:** https://github.com/EarlAiAssistant/kalshi-oracle

---

*Document reflects live system as of February 14, 2026*
