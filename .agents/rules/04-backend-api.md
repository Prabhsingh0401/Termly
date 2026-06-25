---
trigger: always_on
---

# Termly — Backend & API Design

## Architecture
- **Runtime:** Node.js Lambda functions (all business logic)
- **Gateway:** AWS API Gateway (REST, request throttling, CloudWatch logs)
- **Auth:** AWS Cognito — JWT Bearer token in `Authorization` header on every request
- **Base prefix:** `/api/v1/`
- **Response format:** JSON

---

## Auth Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register user + create organisation |
| POST | `/auth/login` | Cognito auth → returns JWT + refresh token |

**JWT:** 24h expiry · Refresh token: 30 days · Google OAuth supported

---

## Contracts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/contracts` | List contracts for org (paginated, filterable) |
| POST | `/contracts` | Create contract record + return S3 presigned upload URL |
| GET | `/contracts/:id` | Get contract detail with obligations and AI extraction |
| PATCH | `/contracts/:id` | Update contract metadata |
| DELETE | `/contracts/:id` | Soft-delete (status → archived) |
| GET | `/contracts/:id/extract-status` | Poll AI extraction job progress |

**Contract statuses:** `draft` → `pending` → `active` → `expiring` → `expired` / `terminated` / `renewed`

---

## Vendors

| Method | Endpoint | Description |
|---|---|---|
| GET | `/vendors` | List vendors for org |
| POST | `/vendors` | Create vendor profile |
| GET | `/vendors/:id` | Get vendor with all contracts + aggregate risk score |

---

## Obligations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/obligations` | List obligations filtered by due date / status |
| POST | `/obligations` | Create manual obligation |
| PATCH | `/obligations/:id` | Update obligation status (complete / snooze) |

---

## Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | Aggregated KPIs — active count, total spend, expiring-soon |

Cached in ElastiCache (Redis) to keep response <500ms.

---

## Search

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?q=&filters=` | Full-text search via OpenSearch across titles, vendors, clause text |

Returns results in <2 seconds for up to 10,000 contracts.

---

## Alerts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/alerts` | List all alerts for the organisation |

---

## Approvals

| Method | Endpoint | Description |
|---|---|---|
| POST | `/workflows/:contractId/approve` | Submit approval decision (approve / reject + comment) |

---

## Audit

| Method | Endpoint | Description |
|---|---|---|
| GET | `/audit-logs` | Paginated audit trail for organisation |

---

## AI Extraction Pipeline

```
PDF upload → S3 (presigned URL, max 50MB)
  → S3 event triggers Lambda
    → Textract analyzeDoc(s3_key) → raw text
      → Bedrock (Claude 3 Sonnet) extractClauses()
        → JSON: { parties, effective_date, expiry, auto_renewal, value,
                  payment_terms, notice_period, governing_law, risk_score, summary }
          → INSERT into contracts + auto-create obligations
            → Poll via GET /contracts/:id/extract-status
```

Target: <60 seconds end-to-end for docs up to 30 pages. Docs >30 pages are chunked.

---

## Alert Pipeline

```
EventBridge (daily cron)
  → Lambda scans obligations WHERE due_date IN (TODAY+90, TODAY+30, TODAY+7)
    → SES → email to assigned user
    → SNS → SMS (if user preference = sms)
      → INSERT into alerts (sent_at, channel)
        → INSERT into audit_logs
```

---

## Security
| Concern | Implementation |
|---|---|
| Data encryption at rest | AES-256 via AWS KMS |
| Data in transit | TLS 1.3 |
| S3 contract access | Private bucket; pre-signed URLs with 15-min expiry |
| Multi-tenancy isolation | `org_id` on every table; Lambda always scopes queries to org |
| Audit retention | audit_logs retained minimum 12 months |

---

## Scalability
- Lambda concurrency capped at 500
- Aurora auto-scales; auto-pauses when idle (cost control)
- 99.9% uptime target (Aurora Multi-AZ)
