# Mac Mini Migration Checklist

Migrating Earl from AWS VPS to Mac Mini (Target: Monday Feb 17, 2026)

## Pre-Migration (Before Monday)
- [ ] Mac Mini arrives and is set up
- [ ] macOS configured with user account
- [ ] Homebrew installed
- [ ] Node.js 22+ installed (`brew install node`)
- [ ] Python 3.11+ installed (`brew install python@3.11`)
- [ ] Git configured with SSH keys

## Install OpenClaw
- [ ] `npm install -g openclaw`
- [ ] `openclaw init` - follow setup prompts
- [ ] Configure Telegram channel
- [ ] Test basic communication

## Transfer Credentials & Config
- [ ] Kalshi API credentials (`.env` file in kalshi-oracle)
- [ ] Kalshi RSA private key (`~/.kalshi/private_key.pem`)
- [ ] Twitter/Bird cookies (`~/.config/bird/config.json5`)
- [ ] OpenClaw config (`~/.openclaw/config.yaml`)
- [ ] Any API keys (Anthropic, etc.)

## Transfer Workspace
- [ ] Clone repos from GitHub:
  - `git clone https://github.com/EarlAiAssistant/kalshi-oracle`
  - `git clone https://github.com/EarlAiAssistant/earl-dashboard`
- [ ] Copy memory files from VPS (`~/.openclaw/workspace/memory/`)
- [ ] Copy MEMORY.md, SOUL.md, USER.md, etc.
- [ ] Install Python dependencies: `cd kalshi-oracle && pip install -r requirements.txt`

## Restore Cron Jobs
- [ ] Re-create Kalshi monitoring cron (15-min scan)
- [ ] Re-create auto-trade cron (2-hour)
- [ ] Re-create daily briefing (8am MT)
- [ ] Re-create weekly review (Sunday 10am MT)

## Verify Everything Works
- [ ] Test Kalshi API connection (`python scripts/list_markets.py`)
- [ ] Test heartbeat system
- [ ] Test Telegram communication
- [ ] Verify cron jobs fire correctly
- [ ] Check one full scan cycle

## Final Steps: AWS Shutdown
- [ ] Confirm Mac Mini Earl is fully operational (24hr test)
- [ ] Export any remaining files from VPS
- [ ] **Stop EC2 instance** (keeps data, stops billing compute)
- [ ] Wait 1 week to ensure nothing was missed
- [ ] **Terminate EC2 instance** (deletes everything, stops all billing)
- [ ] Delete any remaining EBS volumes
- [ ] Verify AWS bill shows $0 going forward

---

## Quick Reference: What Lives Where

| Item | Location on VPS | Transfer Method |
|------|-----------------|-----------------|
| Kalshi Oracle | `~/kalshi-oracle/` | GitHub |
| RSA Key | `~/.kalshi/private_key.pem` | Secure copy (scp) |
| Bird Cookies | `~/.config/bird/config.json5` | Secure copy |
| Memory Files | `~/.openclaw/workspace/memory/` | Secure copy |
| Trade Log | `kalshi-oracle/data/trades/` | GitHub |
| OpenClaw Config | `~/.openclaw/config.yaml` | Secure copy |

## SCP Commands (run from Mac Mini)
```bash
# Replace YOUR_VPS_IP with actual IP
scp -r ubuntu@YOUR_VPS_IP:~/.kalshi ~/
scp -r ubuntu@YOUR_VPS_IP:~/.config/bird ~/.config/
scp -r ubuntu@YOUR_VPS_IP:~/.openclaw ~/
```
