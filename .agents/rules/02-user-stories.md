---
trigger: always_on
---

# Termly — User Stories

Priority: **P0** = MVP blocker · **P1** = Core feature · **P2** = Nice to have

---

## Auth & Organisation

| ID | As a… | I want to… | So that… | P |
|---|---|---|---|---|
| US-A1 | Any user | Sign up via email or Google OAuth | I can access the platform quickly | P0 |
| US-A2 | Admin | Invite team members by email | My team can collaborate on contracts | P0 |
| US-A3 | Admin | Assign roles (Admin / Manager / Viewer) | Access is scoped appropriately | P0 |
| US-A4 | Admin | Configure org-wide notification preferences | My team gets relevant alerts only | P1 |

---

## Contract Management

| ID | As a… | I want to… | So that… | P |
|---|---|---|---|---|
| US-01 | Admin | Upload a vendor contract PDF | AI extracts all key dates automatically | P0 |
| US-02 | Admin | Get email alerts 90/30/7 days before renewal | I can decide to renew or exit in time | P0 |
| US-03 | Manager | See all contracts expiring this quarter | I can plan procurement budget | P0 |
| US-06 | Admin | Set approval workflows before contract activation | Multiple stakeholders sign off | P1 |
| US-08 | Admin | Export a contract summary as PDF | I can share with external auditors | P2 |
| US-C1 | Admin | Attach amendments or addendums to a contract | All versions are in one place | P2 |

---

## Vendor Management

| ID | As a… | I want to… | So that… | P |
|---|---|---|---|---|
| US-04 | Manager | Create a vendor profile with risk score | I have a single view of vendor health | P1 |
| US-V1 | Manager | See all contracts linked to a vendor | I understand our full exposure with that vendor | P1 |
| US-V2 | Manager | Upload vendor compliance documents | Insurance and certs are stored alongside contracts | P2 |

---

## Analytics & Search

| ID | As a… | I want to… | So that… | P |
|---|---|---|---|---|
| US-05 | Finance | View total contracted spend by category | I can report liabilities to the board | P1 |
| US-07 | All | Search contracts by name, date, or keyword | I find any contract in under 10 seconds | P1 |
| US-D1 | Finance | See spend trend monthly/quarterly | I can track cost over time | P2 |

---

## Acceptance Criteria (Key P0 Stories)

**US-01 — Contract Upload & AI Extraction**
- PDF up to 50 MB accepted via drag-and-drop
- Textract + Bedrock extraction completes in <60 seconds
- Extracted fields: parties, effective date, expiry, auto-renewal clause, value, payment terms, notice period, governing law
- All fields pre-populated but user-editable
- Risk score (Low/Medium/High) with one-paragraph justification generated

**US-02 — Renewal Alerts**
- EventBridge fires daily at a fixed time
- SES sends email at exactly 90, 30, and 7 days before each contract end_date
- Alert logged in audit_logs with timestamp and channel

**US-03 — Expiring Contracts View**
- Dashboard shows contracts expiring in next 30/60/90 days
- Filterable by vendor, category, risk score
- Sortable by expiry date
