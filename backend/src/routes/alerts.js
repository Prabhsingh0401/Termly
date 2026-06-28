const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { query } = require('../db');

// GET /api/v1/alerts — List alerts scoped to org
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT a.*, c.title AS contract_title, c.end_date
       FROM alerts a
       JOIN contracts c ON c.id = a.contract_id
       WHERE c.org_id = $1
       ORDER BY a.scheduled_for DESC
       LIMIT 50`,
      [req.user.orgId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;
