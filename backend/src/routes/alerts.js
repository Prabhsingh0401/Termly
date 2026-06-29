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
       WHERE c.org_id = $1 AND a.sent_at IS NOT NULL
       ORDER BY a.sent_at DESC
       LIMIT 50`,
      [req.user.orgId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// PATCH /api/v1/alerts/:id/read — Mark single alert as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { orgId } = req.user;

    const result = await query(
      `UPDATE alerts a
       SET read = TRUE
       FROM contracts c
       WHERE a.id = $1 AND a.contract_id = c.id AND c.org_id = $2
       RETURNING a.*`,
      [id, orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found or access denied.' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('PATCH /alerts/:id/read error:', err);
    res.status(500).json({ error: 'Failed to update alert status.' });
  }
});

// POST /api/v1/alerts/mark-all-read — Mark all alerts as read for org
router.post('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;

    await query(
      `UPDATE alerts a
       SET read = TRUE
       FROM contracts c
       WHERE a.contract_id = c.id AND c.org_id = $1`,
      [orgId]
    );

    res.json({ message: 'All alerts marked as read.' });
  } catch (err) {
    console.error('POST /alerts/mark-all-read error:', err);
    res.status(500).json({ error: 'Failed to mark all alerts as read.' });
  }
});

module.exports = router;
