---
trigger: always_on
---

# Termly — Database Schema

**DB:** Amazon Aurora PostgreSQL Serverless v2  
**Multi-tenancy:** Every table has `org_id` — all queries scoped to org at Lambda level + Aurora RLS policies.

---

## organizations
Root tenant. Every user, vendor, and contract belongs to one org.

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(255) | NOT NULL |
| plan_type | ENUM(free, pro, enterprise) | NOT NULL DEFAULT 'free' |
| seats_limit | INTEGER | DEFAULT 5 |
| settings | JSONB | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## users

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PRIMARY KEY |
| org_id | UUID | FK → organizations |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| role | ENUM(admin, manager, viewer) | NOT NULL |
| cognito_sub | VARCHAR(255) | UNIQUE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## vendors

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PRIMARY KEY |
| org_id | UUID | FK → organizations |
| name | VARCHAR(255) | NOT NULL |
| category | VARCHAR(100) | nullable |
| country | VARCHAR(100) | nullable |
| contact_email | VARCHAR(255) | nullable |
| risk_score | ENUM(low, medium, high) | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

`risk_score` = average of AI risk scores across all active contracts for this vendor.

---

## contracts
Core entity. Every PDF upload creates one record.

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PRIMARY KEY |
| org_id | UUID | FK → organizations |
| vendor_id | UUID | FK → vendors |
| created_by | UUID | FK → users |
| title | VARCHAR(500) | NOT NULL |
| status | ENUM(draft, pending, active, expiring, expired, terminated, renewed) | NOT NULL |
| contract_type | VARCHAR(100) | nullable |
| value | DECIMAL(15,2) | nullable |
| currency | CHAR(3) | DEFAULT 'USD' |
| start_date | DATE | nullable |
| end_date | DATE | nullable |
| auto_renewal | BOOLEAN | DEFAULT FALSE |
| notice_period_days | INTEGER | nullable |
| ai_risk_score | ENUM(low, medium, high) | nullable |
| ai_summary | TEXT | nullable |
| s3_key | VARCHAR(500) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## obligations
Contractual duties with due dates. Auto-created from AI extraction on contract creation.

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PRIMARY KEY |
| contract_id | UUID | FK → contracts |
| type | ENUM(payment, renewal, audit, review, notice, custom) | NOT NULL |
| description | TEXT | nullable |
| due_date | DATE | NOT NULL |
| status | ENUM(pending, completed, overdue) | DEFAULT 'pending' |
| assigned_to | UUID | FK → users, nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## alerts
Scheduled notification records. Written when alert is created; `sent_at` populated after delivery.

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PRIMARY KEY |
| contract_id | UUID | FK → contracts |
| obligation_id | UUID | FK → obligations, nullable |
| alert_type | ENUM(renewal_90, renewal_30, renewal_7, obligation_due) | NOT NULL |
| scheduled_for | TIMESTAMPTZ | NOT NULL |
| sent_at | TIMESTAMPTZ | nullable |
| channel | ENUM(email, sms, in_app) | NOT NULL |

---

## documents
Supporting docs attached to a contract (amendments, addendums, compliance certs).

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PRIMARY KEY |
| contract_id | UUID | FK → contracts |
| s3_key | VARCHAR(500) | NOT NULL |
| doc_type | VARCHAR(100) | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## audit_logs
Immutable. Every user action and system event is written here. Retained minimum 12 months.

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PRIMARY KEY |
| org_id | UUID | FK → organizations |
| user_id | UUID | FK → users, nullable |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | UUID | nullable |
| old_value | JSONB | nullable |
| new_value | JSONB | nullable |
| ip_address | INET | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## Relationships (Summary)

```
organizations
  ├── users (org_id)
  ├── vendors (org_id)
  ├── contracts (org_id)
  │     ├── obligations (contract_id)
  │     ├── alerts (contract_id)
  │     └── documents (contract_id)
  └── audit_logs (org_id)
```

---

## Key Indexes (recommended)
```sql
CREATE INDEX idx_contracts_org_status   ON contracts(org_id, status);
CREATE INDEX idx_contracts_end_date     ON contracts(end_date);
CREATE INDEX idx_obligations_due_date   ON obligations(due_date, status);
CREATE INDEX idx_alerts_scheduled_for   ON alerts(scheduled_for, sent_at);
CREATE INDEX idx_audit_logs_org_created ON audit_logs(org_id, created_at DESC);
```
