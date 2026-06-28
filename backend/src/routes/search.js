const router = require('express').Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET / — full-text search across contracts
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const { orgId } = req.user;

    let result;

    if (!q || q.trim() === '') {
      result = await db.query(
        `SELECT c.id, c.title, c.status, c.value, c.currency, c.end_date,
                c.ai_risk_score, c.contract_type, c.created_at, c.ai_summary,
                v.name AS vendor_name
         FROM contracts c
         LEFT JOIN vendors v ON v.id = c.vendor_id
         WHERE c.org_id = $1
         ORDER BY c.updated_at DESC
         LIMIT 30`,
        [orgId]
      );
    } else {
      const pattern = '%' + q + '%';
      result = await db.query(
        `SELECT c.id, c.title, c.status, c.value, c.currency, c.end_date,
                c.ai_risk_score, c.contract_type, c.created_at, c.ai_summary,
                v.name AS vendor_name
         FROM contracts c
         LEFT JOIN vendors v ON v.id = c.vendor_id
         WHERE c.org_id = $1
           AND (
             c.title        ILIKE $2 OR
             c.ai_summary   ILIKE $2 OR
             v.name         ILIKE $2 OR
             c.contract_type ILIKE $2
           )
         ORDER BY c.updated_at DESC
         LIMIT 30`,
        [orgId, pattern]
      );
    }

    res.json({ data: result.rows, query: q });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
