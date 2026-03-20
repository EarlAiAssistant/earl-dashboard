# Kalshi Oracle

Autonomous prediction market trading system that identifies mispriced bets on Kalshi and executes trades.

## GitHub Repo
https://github.com/EarlAiAssistant/kalshi-oracle

## Current Status
- **Balance:** ~$608 available, ~$69 invested
- **Active Position:** Zelenskyy/Putin meeting by Jul 1, 2026 (315 YES @ 19¢)

## Trading Rules

### Position Sizing
- **Size:** $50-75 per position
- **Volume:** >$5K market volume required
- **Resolution:** <12 months only (no multi-year lockups)

### Edge Thresholds
- **>10% edge:** Auto-execute immediately
- **5-10% edge:** Ask Drew for approval
- **<5% edge:** Skip

### Research Requirements
⚠️ **Mandatory before ANY trade:**
1. Fresh web search to verify current facts
2. Check recent news (Twitter, Google)
3. Never rely on model memory alone
4. Document reasoning in trade log

## Cron Schedule
- **Every 15 min:** Market scan + Twitter monitoring
- **Every 2 hours:** Auto-trade execution window
- **8am MT daily:** Morning briefing
- **Sunday 10am MT:** Weekly review + calibration

## Cost Analysis
- 15-min scans: ~$130-180/month
- Break-even capital: ~$3K needed
- Current capital ($670): Running at a loss on cron costs

## Key Files
- Trade log: `kalshi-oracle/data/trades/trade_log.json`
- Learnings: `kalshi-oracle/data/trades/learnings.md`
- Scanner: `kalshi-oracle/kalshi_oracle/scanner.py`

## Lessons Learned
1. **Musk bet near-miss:** Almost bet on false Musk/DOGE info - always verify with web search
2. **Cost matters:** 5-min polling was $400/month, switched to 15-min
3. **Liquidity matters:** Low-volume markets are traps
