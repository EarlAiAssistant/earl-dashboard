# Kalshi Oracle: Complete System Architecture

**Version:** 1.0  
**Author:** Earl (AI Trading Assistant)  
**Date:** February 14, 2026

---

## Executive Summary

Kalshi Oracle is an autonomous prediction market trading system that scans Kalshi.com for mispriced contracts, performs deep research to verify edge, and executes trades based on predefined risk parameters. The system combines Python-based market analysis with AI-powered decision making through OpenClaw.

---

## System Components

### 1. Core Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Market Scanner | Python 3.11 | Fetches and analyzes Kalshi markets |
| Trading Client | Python + RSA Auth | Executes authenticated trades |
| AI Decision Engine | OpenClaw (Claude) | Research, analysis, trade decisions |
| Scheduling | OpenClaw Cron | Triggers scans and trade windows |
| News Monitoring | Bird CLI + Brave API | Real-time event detection |
| Data Storage | JSON files | Trade logs, learnings, calibration |

### 2. File Structure

```
kalshi-oracle/
├── kalshi_oracle/
│   ├── __init__.py
│   ├── client.py          # RSA-authenticated Kalshi API client
│   └── scanner.py         # Market scanning and analysis
├── scripts/
│   ├── list_markets.py    # List all available markets
│   └── scan_opportunities.py  # Find mispriced contracts
├── data/
│   └── trades/
│       ├── trade_log.json    # All executed trades
│       └── learnings.md      # Post-trade analysis
├── .env                   # API credentials (not in git)
└── requirements.txt
```

---

## How It Works: The Complete Flow

### Phase 1: Market Scanning (Every 15 Minutes)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRON JOB TRIGGERS                            │
│              (OpenClaw cron, every 15 minutes)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 EARL RECEIVES WAKE EVENT                        │
│                                                                 │
│  Message: "Run Kalshi 15-min scan. Check positions for >5%     │
│  movement. Scan Twitter for breaking news on active markets.   │
│  Report only significant findings."                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EARL EXECUTES SCAN                           │
│                                                                 │
│  1. Run: python scripts/scan_opportunities.py                  │
│  2. Check current positions via Kalshi API                     │
│  3. Scan Twitter via Bird CLI for breaking news                │
│  4. Search web for relevant headlines                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EVALUATE FINDINGS                             │
│                                                                 │
│  • Position moved >5%? → Alert Drew                            │
│  • Breaking news affecting position? → Alert Drew              │
│  • New opportunity found? → Queue for trade window             │
│  • Nothing significant? → HEARTBEAT_OK (silent)                │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: Trade Execution Window (Every 2 Hours)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRON JOB TRIGGERS                            │
│               (OpenClaw cron, every 2 hours)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 EARL RECEIVES TRADE WINDOW                      │
│                                                                 │
│  Message: "Kalshi auto-trade window. Review any opportunities   │
│  identified in recent scans. Execute trades meeting criteria." │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              DEEP RESEARCH (Mandatory Step)                     │
│                                                                 │
│  For each potential trade:                                      │
│  1. Web search for current facts (Brave API)                   │
│  2. Check recent news (last 24-48 hours)                       │
│  3. Verify claims don't rely on stale model knowledge          │
│  4. Assess base rates and historical patterns                  │
│  5. Calculate true probability estimate                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EDGE CALCULATION                             │
│                                                                 │
│  Edge = (My Probability - Market Price) / Market Price         │
│                                                                 │
│  Example:                                                       │
│  • Market price: 19¢ (implies 19% probability)                 │
│  • My estimate: 30% probability                                │
│  • Edge: (0.30 - 0.19) / 0.19 = 58% edge                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DECISION MATRIX                               │
│                                                                 │
│  ┌─────────────────┬────────────────────────────────────┐      │
│  │ Edge            │ Action                              │      │
│  ├─────────────────┼────────────────────────────────────┤      │
│  │ >10%            │ AUTO-EXECUTE (no approval needed)   │      │
│  │ 5-10%           │ ASK DREW (send Telegram message)    │      │
│  │ <5%             │ SKIP (not worth the risk)           │      │
│  └─────────────────┴────────────────────────────────────┘      │
│                                                                 │
│  Additional filters:                                            │
│  • Market volume must be >$5,000                               │
│  • Resolution must be <12 months away                          │
│  • Position size: $50-75                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TRADE EXECUTION                               │
│                                                                 │
│  If criteria met:                                               │
│  1. Connect to Kalshi API with RSA authentication              │
│  2. Place limit order at target price                          │
│  3. Log trade to trade_log.json                                │
│  4. Notify Drew via Telegram                                   │
│  5. Update learnings.md with reasoning                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cron Job Specifications

### Job 1: 15-Minute Market Scan

| Field | Value |
|-------|-------|
| **Schedule** | Every 15 minutes |
| **Type** | systemEvent (main session) |
| **Purpose** | Quick position check + news monitoring |
| **Cost** | ~$0.15-0.25 per run |
| **Monthly Cost** | ~$130-180 |

**Trigger Message:**
```
Run Kalshi 15-min scan. Check positions for >5% movement. 
Scan Twitter for breaking news on active markets. 
Report only significant findings.
```

### Job 2: 2-Hour Auto-Trade Window

| Field | Value |
|-------|-------|
| **Schedule** | Every 2 hours |
| **Type** | systemEvent (main session) |
| **Purpose** | Deep analysis + trade execution |
| **Cost** | ~$0.50-1.00 per run |
| **Monthly Cost** | ~$6-12 |

**Trigger Message:**
```
Kalshi auto-trade window. Review any opportunities from recent scans. 
For promising markets: do deep research, verify facts with web search, 
calculate edge, execute if >10% edge. Ask Drew if 5-10% edge.
```

### Job 3: Daily Briefing

| Field | Value |
|-------|-------|
| **Schedule** | 8:00 AM Mountain Time daily |
| **Type** | systemEvent (main session) |
| **Purpose** | Morning summary for Drew |
| **Cost** | ~$0.30 per run |

**Trigger Message:**
```
Good morning! Kalshi daily briefing. Summarize:
1. Current positions and P&L
2. Any overnight movements
3. Upcoming resolution dates
4. Top opportunities on watchlist
```

### Job 4: Weekly Review

| Field | Value |
|-------|-------|
| **Schedule** | Sunday 10:00 AM Mountain Time |
| **Type** | systemEvent (main session) |
| **Purpose** | Calibration and performance review |
| **Cost** | ~$0.50 per run |

**Trigger Message:**
```
Weekly Kalshi review. Analyze:
1. Trades made this week
2. Win/loss record
3. Calibration check (predicted vs actual)
4. Lessons learned
5. Strategy adjustments
Update learnings.md with insights.
```

---

## Authentication: RSA Key Signing

Kalshi requires RSA-signed requests for trading. Here's how it works:

```
┌─────────────────────────────────────────────────────────────────┐
│                   REQUEST SIGNING FLOW                          │
│                                                                 │
│  1. Create timestamp (milliseconds since epoch)                │
│  2. Build message: timestamp + method + path + body            │
│  3. Sign message with RSA private key (PKCS1v15 + SHA256)      │
│  4. Base64 encode signature                                    │
│  5. Add headers:                                                │
│     • KALSHI-ACCESS-KEY: <api_key_id>                          │
│     • KALSHI-ACCESS-SIGNATURE: <base64_signature>              │
│     • KALSHI-ACCESS-TIMESTAMP: <timestamp>                     │
└─────────────────────────────────────────────────────────────────┘
```

**Key Storage:**
- Private key: `~/.kalshi/private_key.pem`
- API Key ID: In `.env` file (KALSHI_API_KEY)

---

## Risk Management

### Position Limits

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max position size | $75 | Limit downside per trade |
| Min position size | $50 | Ensure meaningful returns |
| Max positions | 10 | Diversification |
| Max single-market exposure | 15% of capital | Avoid concentration |

### Time Limits

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max resolution time | 12 months | Avoid capital lockup |
| Preferred resolution | 1-6 months | Balance edge decay vs. opportunity cost |

### Quality Filters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Min market volume | $5,000 | Ensure liquidity |
| Min edge required | 5% | Cover fees + uncertainty |
| Research requirement | Mandatory | Avoid overconfidence |

---

## The Research Protocol

**⚠️ This is the most critical step. Every trade MUST include:**

### 1. Fresh Web Search
```
Query: "[market topic] latest news 2026"
Purpose: Verify current state, catch recent developments
```

### 2. Twitter/Social Scan
```
Tool: Bird CLI with Drew's cookies
Query: Key figures, hashtags, breaking news
Purpose: Real-time sentiment and news
```

### 3. Base Rate Analysis
```
Questions:
• How often has this happened historically?
• What's the reference class?
• Am I anchoring on the market price?
```

### 4. Contrarian Check
```
Questions:
• Why is the market pricing it this way?
• What do I know that others don't?
• Could I be wrong?
```

### 5. Documentation
```
All reasoning goes in trade_log.json:
• Thesis
• Key evidence
• Confidence level
• What would change my mind
```

---

## Data Tracking

### trade_log.json Structure

```json
{
  "trades": [
    {
      "id": "trade_001",
      "timestamp": "2026-02-14T02:30:00Z",
      "market": "KXZELENSKYPUTIN-29-26JUL",
      "side": "YES",
      "contracts": 315,
      "price": 0.19,
      "cost": 59.85,
      "edge_estimate": 0.58,
      "my_probability": 0.30,
      "thesis": "Diplomatic pressure mounting, multiple back-channels active",
      "key_evidence": [
        "Swiss mediation ongoing",
        "Trump administration pushing for summit",
        "Both sides showing flexibility"
      ],
      "exit_price": null,
      "outcome": null,
      "resolved": false
    }
  ]
}
```

### learnings.md Structure

```markdown
# Kalshi Oracle: Lessons Learned

## Trade Reviews

### 2026-02-14: Zelenskyy/Putin Meeting
- **Entry:** 19¢ YES
- **Thesis:** Diplomatic momentum underestimated
- **Status:** Open
- **Lessons:** TBD after resolution

## General Insights

### Research Discipline
- Always verify with web search
- Model knowledge can be months stale
- Near-miss on Musk/DOGE bet taught us this

### Market Psychology
- Markets often underreact to slow-moving developments
- Binary events get overpriced near deadlines
- Volume correlates with smart money attention
```

---

## Cost Analysis

### Monthly Operating Costs

| Component | Frequency | Cost/Run | Monthly Total |
|-----------|-----------|----------|---------------|
| 15-min scan | 96/day | $0.20 | $576 |
| **Optimized 15-min** | 96/day | $0.05* | $144 |
| 2-hour trade window | 12/day | $0.75 | $270 |
| Daily briefing | 1/day | $0.30 | $9 |
| Weekly review | 4/month | $0.50 | $2 |

*With HEARTBEAT_OK optimization (no output when nothing found)

### Break-Even Analysis

| Capital | Expected Return (20% annual) | Monthly Profit | Cron Cost | Net |
|---------|------------------------------|----------------|-----------|-----|
| $670 | $134/year = $11/month | $11 | $150 | -$139 |
| $3,000 | $600/year = $50/month | $50 | $150 | -$100 |
| $10,000 | $2,000/year = $167/month | $167 | $150 | +$17 |
| $25,000 | $5,000/year = $417/month | $417 | $150 | +$267 |

**Conclusion:** System becomes profitable at ~$10K capital with 20% annual returns.

---

## Communication Protocol

### Alert Levels

| Level | Trigger | Action |
|-------|---------|--------|
| 🟢 Routine | Scan complete, nothing found | HEARTBEAT_OK (silent) |
| 🟡 Info | New opportunity identified | Log for next trade window |
| 🟠 Attention | 5-10% edge opportunity | Telegram Drew for approval |
| 🔴 Alert | Position moved >10% or news | Immediate Telegram notification |
| 🚨 Critical | Account issue or API failure | Urgent Telegram + attempt fix |

### Message Templates

**Opportunity Found (needs approval):**
```
🟠 Kalshi Opportunity

Market: [NAME]
Current price: [X]¢ [YES/NO]
My estimate: [Y]%
Edge: [Z]%

Research:
• [Key finding 1]
• [Key finding 2]

Position: $[AMOUNT] for [N] contracts

Approve? Reply YES or NO.
```

**Trade Executed:**
```
✅ Kalshi Trade Executed

Market: [NAME]
Side: [YES/NO] @ [X]¢
Contracts: [N]
Cost: $[AMOUNT]
Edge: [Z]%

Reasoning: [Brief thesis]
```

---

## Recovery Procedures

### If Scan Fails

1. Check Kalshi API status
2. Verify credentials in `.env`
3. Test connection: `python -c "from kalshi_oracle import client; print(client.get_balance())"`
4. If persistent: alert Drew

### If Trade Fails

1. Log error with full details
2. Do NOT retry automatically (avoid double-orders)
3. Check order book for partial fill
4. Alert Drew immediately

### If API Rate Limited

1. Back off exponentially
2. Reduce scan frequency temporarily
3. Alert if persists >1 hour

---

## Future Improvements

### Planned Enhancements

1. **Backtesting Framework** - Test strategies on historical data
2. **Kelly Criterion Sizing** - Optimal position sizing based on edge
3. **Correlation Tracking** - Avoid correlated bets
4. **Automated Exit Signals** - Take profit / stop loss
5. **Multi-Market Arbitrage** - Cross-platform opportunities

### Scaling Path

| Phase | Capital | Features |
|-------|---------|----------|
| Current | $670 | Basic scanning, manual review |
| Phase 2 | $5,000 | Full automation, more positions |
| Phase 3 | $25,000 | Advanced strategies, API optimizations |
| Phase 4 | $100,000+ | Multi-platform, institutional grade |

---

## Appendix: Quick Commands

```bash
# Check Kalshi balance
cd ~/kalshi-oracle && python -c "from kalshi_oracle.client import KalshiClient; c = KalshiClient(); print(c.get_balance())"

# List active positions
python -c "from kalshi_oracle.client import KalshiClient; c = KalshiClient(); print(c.get_positions())"

# Scan for opportunities
python scripts/scan_opportunities.py

# List all markets
python scripts/list_markets.py

# View trade log
cat data/trades/trade_log.json | python -m json.tool
```

---

*Document generated by Earl for Drew Kubacki*  
*Last updated: February 14, 2026*
