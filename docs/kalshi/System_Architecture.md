# Kalshi Oracle: System Architecture

**Version:** 2.2 (Live + Tested)  
**Author:** Earl (AI Trading Assistant)  
**Date:** February 14, 2026  
**Status:** ✅ LIVE & VERIFIED

---

## Executive Summary

Kalshi Oracle is an autonomous prediction market trading system that identifies mispriced contracts on Kalshi.com, performs deep research to verify edge, and executes trades based on predefined risk parameters. 

**Architecture:**
- **Python** (system cron, every 15 min) → Fast scanning, zero AI cost
- **OpenClaw** (cron, every 5 min) → Checks for alerts, sends to Telegram
- **OpenClaw** (cron, every 6 hours) → Deep research + trade decisions with Opus

---

## Current Status

### Account
| Metric | Value |
|--------|-------|
| Available | ~$608 |
| Invested | ~$69 |
| Total | ~$677 |

### Active Positions

| Market | Side | Contracts | Entry | Current | P&L |
|--------|------|-----------|-------|---------|-----|
| Zelenskyy/Putin meet by Jul 2026 | YES | 315 | 19¢ | 17¢ | -10.5% |
| Women's Hockey SVK (manual) | YES | 42 | 22¢ | 16¢ | -27.6% |

### System Health
- ✅ Python Scanner (system cron, every 15 min)
- ✅ Alert Checker (OpenClaw cron, every 5 min)
- ✅ Trade Windows (OpenClaw cron, every 6 hours)
- ✅ Daily Briefing (8am MT)
- ✅ Weekly Review (Sunday 10am MT)

---

## Trading Rules

### Position Sizing
| Parameter | Value |
|-----------|-------|
| Position size | $50-75 |
| Min market volume | $5,000 |
| Max resolution time | 12 months |

### Edge Thresholds
| Edge | Action |
|------|--------|
| >10% | Auto-execute, notify Drew |
| 5-10% | Ask Drew for approval |
| <5% | Skip |

### Research Protocol (Mandatory)
1. ✅ Fresh web search
2. ✅ Recent news (24-48h)
3. ✅ Base rate analysis
4. ✅ Contrarian check

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   SYSTEM CRON (Every 15 min)                    │
│                       Python Scanner                            │
│                         Cost: $0                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  • Check positions for >5% movement                            │
│  • Scan top 50 Politics/Economics/Elections events             │
│  • Update watchlist.json                                        │
│  • Write alerts to pending_alerts.json                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                OPENCLAW CRON (Every 5 min)                      │
│                   Alert Checker (Sonnet)                        │
│                      Cost: ~$0.05/run                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  • Read pending_alerts.json                                     │
│  • If alerts exist → Send to Drew via Telegram                 │
│  • Clear the file after sending                                │
└─────────────────────────────────────────────────────────────────┘

                    ─────────────────────
                    
┌─────────────────────────────────────────────────────────────────┐
│                OPENCLAW CRON (Every 6 hours)                    │
│                  Trade Window (Opus)                            │
│                    Cost: ~$0.40/run                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  • Review watchlist.json candidates                            │
│  • Deep research (web search, news, base rates)                │
│  • Calculate edge vs market price                              │
│  • Execute if >10%, ask Drew if 5-10%                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cron Jobs

### 1. Python Scanner (System Cron)
| Field | Value |
|-------|-------|
| Schedule | `*/15 * * * *` |
| Executor | System crontab |
| Script | `run_cron.sh` |
| Cost | $0 |

### 2. Alert Checker (OpenClaw Cron)
| Field | Value |
|-------|-------|
| Schedule | Every 5 min |
| Model | Sonnet |
| Cost | ~$0.05/run (~$22/month) |

### 3. Trade Window (OpenClaw Cron)
| Field | Value |
|-------|-------|
| Schedule | 2am, 8am, 2pm, 8pm MT |
| Model | **Opus** |
| Cost | ~$0.40/run (~$48/month) |

### 4. Daily Briefing
| Field | Value |
|-------|-------|
| Schedule | 8am MT |
| Model | Sonnet |
| Cost | ~$4.50/month |

### 5. Weekly Review
| Field | Value |
|-------|-------|
| Schedule | Sunday 10am MT |
| Model | **Opus** |
| Cost | ~$2/month |

---

## Cost Analysis

### Monthly Operating Costs
| Component | Frequency | Cost |
|-----------|-----------|------|
| Python scanner | 96/day | $0 |
| Alert checker | 288/day | ~$22 |
| Trade windows | 4/day | ~$48 |
| Daily briefing | 1/day | ~$4.50 |
| Weekly review | 4/month | ~$2 |
| Health check | 6/day | ~$9 |
| **Total** | | **~$85/month** |

### Break-Even
| Capital | Monthly Profit (20% annual) | System Cost | Net |
|---------|----------------------------|-------------|-----|
| $677 (current) | $11 | $85 | -$74 |
| $5,000 | $83 | $85 | -$2 |
| $6,000 | $100 | $85 | +$15 |
| $10,000 | $167 | $85 | +$82 |

**Break-even: ~$5,500 capital**

---

## File Structure

```
kalshi-oracle/
├── scripts/
│   ├── cron_scan.py           # Python scanner
│   └── run_cron.sh            # System cron wrapper
├── data/
│   ├── watchlist.json         # Candidates for review
│   ├── positions_cache.json   # Entry price tracking
│   ├── pending_alerts.json    # Alerts for OpenClaw to send
│   └── trades/
│       ├── trade_log.json
│       └── learnings.md
└── docs/
    └── ARCHITECTURE.md
```

---

## Alert Flow (Verified ✅)

1. **Python detects** position move >5% or high-vol opportunity
2. **Python writes** alert to `pending_alerts.json`
3. **OpenClaw cron** (every 5 min) reads the file
4. **Sonnet sends** alert to Drew via Telegram
5. **File cleared** after sending

**Tested:** Feb 14, 2026 3:51am MT ✅

---

## Quick Commands

```bash
# Manual scan
cd ~/kalshi-oracle && python3 scripts/cron_scan.py --verbose

# Check watchlist
cat data/watchlist.json | python3 -m json.tool

# Check pending alerts
cat data/pending_alerts.json

# View cron log
tail -50 /tmp/kalshi-cron.log

# System cron
crontab -l
```

---

## GitHub
https://github.com/EarlAiAssistant/kalshi-oracle

---

*Last updated: February 14, 2026 3:53am MT*
