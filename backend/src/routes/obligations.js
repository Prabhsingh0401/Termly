const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { query } = require('../db');

// GET /api/v1/obligations — List obligations for org with optional status filter
router.get('/', authMiddleware, async (req, res) => {
  try {
    const status = req.query.status || null;
    const { rows } = await query(
      `SELECT o.*, c.title AS contract_title
       FROM obligations o
       JOIN contracts c ON c.id = o.contract_id
       WHERE c.org_id = $1 AND ($2::text IS NULL OR o.status = $2)
       ORDER BY o.due_date ASC`,
      [req.user.orgId, status]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /obligations error:', err);
    res.status(500).json({ error: 'Failed to fetch obligations' });
  }
});

// POST /api/v1/obligations — Create manual obligation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { contract_id, type, description, due_date, assigned_to } = req.body;

    if (!contract_id || !type || !due_date) {
      return res.status(400).json({ error: 'contract_id, type, and due_date are required' });
    }

    // Validate contract belongs to org
    const contractCheck = await query(
      `SELECT id FROM contracts WHERE id = $1 AND org_id = $2`,
      [contract_id, req.user.orgId]
    );
    if (contractCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Contract not found or access denied' });
    }

    const { rows } = await query(
      `INSERT INTO obligations (contract_id, type, description, due_date, assigned_to)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [contract_id, type, description || null, due_date, assigned_to || null]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error('POST /obligations error:', err);
    res.status(500).json({ error: 'Failed to create obligation' });
  }
});

// PATCH /api/v1/obligations/:id — Update obligation status
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'completed', 'overdue'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    // Scope check via JOIN
    const { rows } = await query(
      `UPDATE obligations o
       SET status = $1
       FROM contracts c
       WHERE o.id = $2
         AND o.contract_id = c.id
         AND c.org_id = $3
       RETURNING o.*`,
      [status, req.params.id, req.user.orgId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Obligation not found or access denied' });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('PATCH /obligations/:id error:', err);
    res.status(500).json({ error: 'Failed to update obligation' });
  }
});

module.exports = router;
