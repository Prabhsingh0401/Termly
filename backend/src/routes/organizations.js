const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'termly_super_secret_key_change_in_production';

// POST /api/v1/organizations
// Creates a new organization and associates the authenticated user with it
router.post('/', authMiddleware, async (req, res, next) => {
  const { name, planType } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Organization name is required.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create the organization record
    const orgRes = await client.query(
      'INSERT INTO organizations (name, plan_type) VALUES ($1, $2) RETURNING *',
      [name, planType || 'free']
    );
    const org = orgRes.rows[0];

    // 2. Associate user with the new organization and set role as admin
    const userRes = await client.query(
      'UPDATE users SET org_id = $1, role = $2 WHERE id = $3 RETURNING id, org_id, email, full_name, role',
      [org.id, 'admin', req.user.id]
    );
    const user = userRes.rows[0];

    // 3. Write an audit log entry
    await client.query(
      `INSERT INTO audit_logs (org_id, user_id, action, entity_type, entity_id, new_value)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        org.id,
        user.id,
        'create',
        'organization',
        org.id,
        JSON.stringify({ name: org.name, plan_type: org.plan_type })
      ]
    );

    await client.query('COMMIT');

    // Sign a new token containing the updated orgId
    const token = jwt.sign(
      { id: user.id, orgId: user.org_id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Organization created successfully.',
      organization: org,
      user,
      token,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Organization creation failed:', err);
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
