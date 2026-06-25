---
trigger: always_on
---

# Termly — System Diagrams

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│              Next.js 14 App (Vercel) — React + Tailwind     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST
┌──────────────────────────▼──────────────────────────────────┐
│                     AWS SERVICE LAYER                        │
│                                                             │
│  ┌─────────────┐   ┌────────────┐   ┌──────────────────┐   │
│  │ API Gateway │──▶│   Lambda   │──▶│    Cognito (Auth) │  │
│  └─────────────┘   └─────┬──────┘   └──────────────────┘   │
│                          │                                  │
│          ┌───────────────┼───────────────┐                  │
│          ▼               ▼               ▼                  │
│    ┌──────────┐  ┌─────────────┐  ┌───────────────┐        │
│    │ Textract │  │   Bedrock   │  │ EventBridge   │        │
│    │  (OCR)   │  │ Claude 3 S. │  │ (daily cron)  │        │
│    └──────────┘  └─────────────┘  └───────┬───────┘        │
│                                           │                 │
│                                    ┌──────▼──────┐          │
│                                    │  SES / SNS  │          │
│                                    └─────────────┘          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       DATA LAYER                            │
│                                                             │
│  ┌──────────────────┐  ┌────────────┐  ┌───────────────┐   │
│  │ Aurora PostgreSQL│  │ OpenSearch │  │ElastiCache    │   │
│  │ (Serverless v2)  │  │  (Search)  │  │(Redis Cache)  │   │
│  └──────────────────┘  └────────────┘  └───────────────┘   │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐                         │
│  │  S3 Bucket  │  │  CloudWatch  │                         │
│  │  (PDFs)     │  │   (Logs)     │                         │
│  └─────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Contract Upload & AI Extraction — Sequence

```
User       Frontend      API GW       Lambda      Textract    Bedrock      Aurora
 │             │             │            │            │           │           │
 │──Upload PDF▶│             │            │            │           │           │
 │             │──POST /contracts─────────▶│            │           │           │
 │             │             │            │──analyzeDoc(s3_key)──▶│           │
 │             │             │            │◀───────raw text────────│           │
 │             │             │            │──extractClauses()──────────────────▶│
 │             │             │            │◀───JSON {clauses, risk}─────────────│
 │             │             │            │──INSERT contract──────────────────▶│
 │             │◀──200 {id, status}────────│            │           │           │
 │◀──show progress bar───────│             │            │           │           │
 │                           │             │            │           │           │
 │──poll /extract-status─────────────────▶│            │           │           │
 │◀──{status: complete, data}─────────────│            │           │           │
 │◀──show AI-filled form─────│             │            │           │           │
```

---

## 3. Alert Pipeline — Sequence

```
EventBridge (daily)
       │
       ▼
    Lambda
       │── SELECT obligations WHERE due_date IN (TODAY+90, TODAY+30, TODAY+7)
       │
       ├── For each obligation:
       │       ├── SES → send email to assigned user
       │       ├── SNS → send SMS (if preference = sms)
       │       ├── INSERT into alerts (sent_at = NOW())
       │       └── INSERT into audit_logs
       │
       └── Done
```

---

## 4. Contract Lifecycle — State Machine

```
                    ┌─────────┐
                    │  DRAFT  │
                    └────┬────┘
                         │ Submit
                    ┌────▼──────────┐
                    │ PENDING REVIEW│
                    └────┬──────────┘
                         │ All approvers sign off
                    ┌────▼────┐
              ┌─────│  ACTIVE │─────────────────────┐
              │     └────┬────┘                     │
              │          │ end_date < 90 days away   │
              │     ┌────▼──────┐                   │
              │     │ EXPIRING  │                   │
              │     └────┬──────┘                   │
              │          │ Lapse        │ Renew      │ Terminate
              │     ┌────▼────┐   ┌────▼─────┐  ┌──▼──────────┐
              │     │ EXPIRED │   │  RENEWED │  │ TERMINATED  │
              │     └─────────┘   └──────────┘  └─────────────┘
              │
              └── (Terminate at any point → TERMINATED)
```

---

## 5. Data Flow — Level 1

```
                        ┌──────────────────────┐
                        │         User         │
                        └──────────┬───────────┘
                                   │ 1. Upload PDF
                        ┌──────────▼───────────┐
                        │   S3 Bucket (D2)     │
                        └──────────┬───────────┘
                                   │ 2. Textract + Bedrock
                        ┌──────────▼───────────┐
                        │  Aurora PostgreSQL   │◀── 3. Store metadata + obligations
                        │       (D1)           │
                        └──────────┬───────────┘
                                   │ 4. EventBridge reads due dates
                        ┌──────────▼───────────┐
                        │    SES / SNS         │──▶ 5. Notify user (email/SMS)
                        └──────────────────────┘
```

---

## 6. Use Case — Actor/System Boundary

```
┌──────────────────────────────────────────────────────┐
│                  ContractIQ System                   │
│                                                      │
│  ┌─────────────────┐    ┌─────────────────────────┐  │
│  │   Admin         │───▶│ Upload Contract PDF      │  │
│  │                 │───▶│ Manage Organisation      │  │
│  │                 │───▶│ Invite Team Members      │  │
│  │                 │───▶│ Set Role Permissions     │  │
│  │                 │───▶│ Configure Alerts         │  │
│  │                 │───▶│ Approve Workflows        │  │
│  └─────────────────┘    └─────────────────────────┘  │
│                                                      │
│  ┌─────────────────┐    ┌─────────────────────────┐  │
│  │   Manager       │───▶│ View Dashboard           │  │
│  │                 │───▶│ Search Contracts         │  │
│  │                 │───▶│ Generate Reports         │  │
│  └─────────────────┘    └─────────────────────────┘  │
│                                                      │
│  ┌─────────────────┐    ┌─────────────────────────┐  │
│  │   AWS Services  │───▶│ AI Extraction (auto)    │  │
│  │                 │───▶│ Deadline Alerts (cron)  │  │
│  └─────────────────┘    └─────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 7. AWS Services — Role Mapping

| Service | Role |
|---|---|
| Aurora PostgreSQL v2 | Primary relational DB — ACID for financial/legal data, auto-pauses when idle |
| S3 | Contract PDF storage — private bucket, pre-signed URLs (15-min expiry) |
| Lambda | All business logic — zero infra, scales per request |
| API Gateway | REST entrypoint — auth, throttling, CloudWatch logging |
| Textract | OCR + structured extraction from PDF |
| Bedrock (Claude 3 Sonnet) | Clause extraction, risk scoring, summaries |
| Cognito | JWT auth, Google OAuth, MFA, org-level tenancy |
| EventBridge | Daily cron trigger for alert pipeline |
| SES | Transactional renewal and workflow emails |
| SNS | SMS fallback for critical alerts |
| OpenSearch | Full-text search across contract content |
| ElastiCache (Redis) | Dashboard and session caching — reduces Aurora load |
| CloudWatch | Logs and monitoring |
