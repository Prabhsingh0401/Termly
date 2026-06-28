require('dotenv').config();
const { pool } = require('./db');

async function migrate() {
  console.log('🔄 Running database migrations...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // 1. Organizations
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        plan_type VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
        seats_limit INTEGER DEFAULT 5,
        settings JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
        cognito_sub VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Vendors
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        country VARCHAR(100),
        contact_email VARCHAR(255),
        risk_score VARCHAR(50) CHECK (risk_score IN ('low', 'medium', 'high')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Contracts
    await client.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
        vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(500) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'pending', 'active', 'expiring', 'expired', 'terminated', 'renewed')),
        contract_type VARCHAR(100),
        value DECIMAL(15,2),
        currency CHAR(3) DEFAULT 'USD',
        start_date DATE,
        end_date DATE,
        auto_renewal BOOLEAN DEFAULT FALSE,
        notice_period_days INTEGER,
        ai_risk_score VARCHAR(50) CHECK (ai_risk_score IN ('low', 'medium', 'high')),
        ai_summary TEXT,
        s3_key VARCHAR(500) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Obligations
    await client.query(`
      CREATE TABLE IF NOT EXISTS obligations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('payment', 'renewal', 'audit', 'review', 'notice', 'custom')),
        description TEXT,
        due_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Alerts
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
        obligation_id UUID REFERENCES obligations(id) ON DELETE SET NULL,
        alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('renewal_90', 'renewal_30', 'renewal_7', 'obligation_due')),
        scheduled_for TIMESTAMPTZ NOT NULL,
        sent_at TIMESTAMPTZ,
        channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms', 'in_app'))
      );
    `);

    // 7. Documents
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
        s3_key VARCHAR(500) NOT NULL,
        doc_type VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 8. Audit Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        old_value JSONB,
        new_value JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_contracts_org_status   ON contracts(org_id, status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_contracts_end_date     ON contracts(end_date);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_obligations_due_date   ON obligations(due_date, status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_alerts_scheduled_for   ON alerts(scheduled_for, sent_at);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(org_id, created_at DESC);');

    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0));
}

module.exports = migrate;
