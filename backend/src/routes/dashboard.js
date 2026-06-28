const router = require('express').Router();
const { query } = require('../db');
const authMiddleware = require('../middleware/auth');

// ─── GET /stats — Aggregated dashboard KPIs ───────────────────────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;

    const [
      activeResult,
      spendResult,
      exp30Result,
      exp90Result,
      billingResult,
      categoryResult,
      statusResult,
      obligationsResult,
    ] = await Promise.all([
      // Active contracts count
      query(
        `SELECT COUNT(*) AS count FROM contracts
         WHERE org_id = $1 AND status IN ('active', 'expiring')`,
        [orgId]
      ),

      // Total contracted spend
      query(
        `SELECT COALESCE(SUM(value), 0) AS total FROM contracts
         WHERE org_id = $1 AND status NOT IN ('terminated', 'expired', 'draft')`,
        [orgId]
      ),

      // Expiring in 30 days
      query(
        `SELECT COUNT(*) AS count FROM contracts
         WHERE org_id = $1
           AND end_date <= NOW() + INTERVAL '30 days'
           AND end_date >= NOW()
           AND status NOT IN ('terminated', 'expired')`,
        [orgId]
      ),

      // Expiring in 90 days
      query(
        `SELECT COUNT(*) AS count FROM contracts
         WHERE org_id = $1
           AND end_date <= NOW() + INTERVAL '90 days'
           AND end_date >= NOW()
           AND status NOT IN ('terminated', 'expired')`,
        [orgId]
      ),

      // Upcoming billing obligations (payment type, due in 30 days)
      query(
        `SELECT COUNT(*) AS count
         FROM obligations o
         JOIN contracts c ON c.id = o.contract_id
         WHERE c.org_id = $1
           AND o.type = 'payment'
           AND o.due_date <= NOW() + INTERVAL '30 days'
           AND o.status = 'pending'`,
        [orgId]
      ),

      // Spend by contract_type
      query(
        `SELECT contract_type AS category, COALESCE(SUM(value), 0) AS total
         FROM contracts
         WHERE org_id = $1 AND status NOT IN ('terminated')
         GROUP BY contract_type
         ORDER BY total DESC`,
        [orgId]
      ),

      // Contract status breakdown
      query(
        `SELECT status, COUNT(*) AS count
         FROM contracts
         WHERE org_id = $1
         GROUP BY status`,
        [orgId]
      ),

      // Recent pending obligations (joined with contract title)
      query(
        `SELECT o.*, c.title AS contract_title
         FROM obligations o
         JOIN contracts c ON c.id = o.contract_id
         WHERE c.org_id = $1 AND o.status = 'pending'
         ORDER BY o.due_date ASC
         LIMIT 8`,
        [orgId]
      ),
    ]);

    res.json({
      activeContracts: parseInt(activeResult.rows[0].count),
      totalSpend: parseFloat(spendResult.rows[0].total),
      expiringIn30: parseInt(exp30Result.rows[0].count),
      expiringIn90: parseInt(exp90Result.rows[0].count),
      upcomingBilling: parseInt(billingResult.rows[0].count),
      spendByCategory: categoryResult.rows,
      contractStatusBreakdown: statusResult.rows,
      recentObligations: obligationsResult.rows,
    });
  } catch (err) {
    console.error('GET /dashboard/stats error:', err);
    res.status(500).json({ error: 'Failed to load dashboard stats.' });
  }
});

module.exports = router;
