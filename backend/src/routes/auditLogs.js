const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { query } = require('../db');

// GET /api/v1/audit-logs — Paginated audit log for org
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator role required.' });
  }
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT al.*, u.full_name AS user_name, u.email AS user_email
         FROM audit_logs al
         LEFT JOIN users u ON u.id = al.user_id
         WHERE al.org_id = $1
         ORDER BY al.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.orgId, limit, offset]
      ),
      query(
        `SELECT COUNT(*) FROM audit_logs WHERE org_id = $1`,
        [req.user.orgId]
      ),
    ]);

    res.json({
      data:  dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    });
  } catch (err) {
    console.error('GET /audit-logs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
