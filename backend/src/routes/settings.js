const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { query } = require('../db');

// GET /api/v1/settings/organization
router.get('/organization', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT o.*, COUNT(u.id) AS seats_used
       FROM organizations o
       LEFT JOIN users u ON u.org_id = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [req.user.orgId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json({ organization: rows[0] });
  } catch (err) {
    console.error('GET /settings/organization error:', err);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// PATCH /api/v1/settings/organization — Update org name
router.patch('/organization', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const { rows } = await query(
      `UPDATE organizations SET name = $1 WHERE id = $2 RETURNING *`,
      [name.trim(), req.user.orgId]
    );
    res.json({ organization: rows[0] });
  } catch (err) {
    console.error('PATCH /settings/organization error:', err);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// PATCH /api/v1/settings/profile — Update user's full name
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'fullName is required' });
    }
    const { rows } = await query(
      `UPDATE users SET full_name = $1 WHERE id = $2
       RETURNING id, org_id, email, full_name, role`,
      [fullName.trim(), req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('PATCH /settings/profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/v1/settings/team — List team members
router.get('/team', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, email, full_name, role, created_at
       FROM users
       WHERE org_id = $1
       ORDER BY created_at ASC`,
      [req.user.orgId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /settings/team error:', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST /api/v1/settings/invite — Invite a new team member
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    const { email, role } = req.body;
    const validRoles = ['admin', 'manager', 'viewer'];

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
    }

    const full_name = email.split('@')[0];

    const { rows } = await query(
      `INSERT INTO users (org_id, email, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, org_id, email, full_name, role, created_at`,
      [req.user.orgId, email.toLowerCase().trim(), full_name, role]
    );

    if (rows.length === 0) {
      return res.status(409).json({ error: 'A user with that email already exists' });
    }

    res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error('POST /settings/invite error:', err);
    res.status(500).json({ error: 'Failed to invite member' });
  }
});

// DELETE /api/v1/settings/team/:userId — Remove team member
router.delete('/team/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const { rowCount } = await query(
      `UPDATE users SET org_id = NULL
       WHERE id = $1 AND org_id = $2 AND id != $3`,
      [userId, req.user.orgId, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Member not found, already removed, or cannot remove yourself' });
    }

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('DELETE /settings/team/:userId error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
