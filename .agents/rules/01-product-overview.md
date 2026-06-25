---
trigger: always_on
---

# Termly — Product Overview

## What It Is
AI-powered B2B SaaS for contract and vendor lifecycle management. Upload a PDF → AI extracts key terms in <60s → track obligations → get deadline alerts → view spend analytics.

---

## Problem
Mid-sized businesses manage vendor contracts across email threads, shared drives, and spreadsheets with no centralised visibility.

**Consequences:**
- Missed renewal deadlines → unwanted auto-renewals
- No visibility into notice periods → locked into bad contracts
- Compliance gaps with no audit trail
- 5–9% annual revenue leakage (World Commerce & Contracting, 2025)

**Why existing tools don't work:**
Enterprise CLM tools (Ironclad, Icertis, Coupa) cost $40k–$100k/year — completely out of reach for SMBs. No affordable, AI-native solution exists for the 10–500 employee segment.

---

## Who It's For
**Target market:** SMB & Mid-market businesses, 10–500 employees

| Persona | Role | Pain |
|---|---|---|
| Priya (Admin) | Legal/Ops Lead, 50-person SaaS startup | Contracts scattered across 4 Google Drive folders |
| Rahul (Manager) | Procurement Manager, manufacturing firm | Calendar reminders ignored; missed 60-day notice windows |
| Sneha (Finance) | CFO, marketing agency | Manual spreadsheet; no live view of obligations or spend |

---

## Why We're Building This
Our family runs businesses where contracts and bills are managed manually — in PDFs, printouts, and Excel sheets. Renewal dates get missed. Auto-renewals trigger without anyone noticing. Payment obligations slip through. These aren't hypothetical scenarios — they're real losses that happen because there's no system that's affordable and simple enough for a non-enterprise business to actually use.

ContractIQ is built from that firsthand frustration.

---

## Value Propositions

| # | What | How |
|---|---|---|
| 1 | Never miss a renewal | Email alerts at 90/30/7 days before every deadline |
| 2 | AI extraction in <60s | Textract OCR → Bedrock (Claude 3 Sonnet) clause analysis |
| 3 | Single source of truth | All contracts, vendors, obligations in one Aurora DB |
| 4 | Vendor risk scoring | AI-generated Low/Medium/High score with justification |
| 5 | Approval workflows | Up to 5-approver chain with full audit trail |
| 6 | Spend analytics | Real-time KPIs: total spend, liabilities, expiring contracts |

---

## Pricing Target
**<$99/month** — vs $40k–$100k/year for enterprise CLM tools.

---

## Tech Stack (Summary)
- **Frontend:** Next.js 14 on Vercel, Tailwind CSS, shadcn/ui
- **Backend:** AWS Lambda (Node.js), API Gateway, Cognito
- **AI Pipeline:** Textract (OCR) → Bedrock / Claude 3 Sonnet
- **DB:** Aurora PostgreSQL Serverless v2
- **Search:** OpenSearch
- **Alerts:** EventBridge (cron) → SES (email) / SNS (SMS)
- **Storage:** S3 (contract PDFs)
- **Cache:** ElastiCache (Redis)

---

## Hackathon
Track 2 — Monetizable B2B Application
