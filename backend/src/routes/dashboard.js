const router = require('express').Router();
const { query } = require('../db');
const authMiddleware = require('../middleware/auth');

// ─── GET /stats — Aggregated dashboard KPIs ───────────────────────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;

    const [
      activeContractsRes,
      activeBillsRes,
      totalSpendRes,
      totalReceivablesRes,
      exp30Res,
      exp90Res,
      billingLiabilitiesRes,
      billingReceivablesRes,
      categoryRes,
      statusRes,
      obligationsRes,
    ] = await Promise.all([
      // Active contracts
      query(
        `SELECT COUNT(*) AS count FROM contracts
         WHERE org_id = $1 AND status IN ('active', 'expiring') AND document_type = 'contract'`,
        [orgId]
      ),
      // Active bills
      query(
        `SELECT COUNT(*) AS count FROM contracts
         WHERE org_id = $1 AND status IN ('active', 'expiring', 'pending') AND document_type = 'bill'`,
        [orgId]
      ),
      // Total contracted spend (contracts only)
      query(
        `SELECT COALESCE(SUM(value), 0) AS total FROM contracts
         WHERE org_id = $1 AND status NOT IN ('terminated', 'expired', 'draft') AND document_type = 'contract'`,
        [orgId]
      ),
      // Total receivables (bills only)
      query(
        `SELECT COALESCE(SUM(value), 0) AS total FROM contracts
         WHERE org_id = $1 AND status NOT IN ('terminated', 'expired', 'draft') AND document_type = 'bill'`,
        [orgId]
      ),
      // Expiring in 30 days (contracts only)
      query(
        `SELECT COUNT(*) AS count FROM contracts
         WHERE org_id = $1
           AND end_date <= NOW() + INTERVAL '30 days'
           AND end_date >= NOW()
           AND status NOT IN ('terminated', 'expired')
           AND document_type = 'contract'`,
        [orgId]
      ),
      // Expiring in 90 days (contracts only)
      query(
        `SELECT COUNT(*) AS count FROM contracts
         WHERE org_id = $1
           AND end_date <= NOW() + INTERVAL '90 days'
           AND end_date >= NOW()
           AND status NOT IN ('terminated', 'expired')
           AND document_type = 'contract'`,
        [orgId]
      ),
      // Upcoming billing liabilities (payment type, due in 30 days, contracts only)
      query(
        `SELECT COUNT(*) AS count
         FROM obligations o
         JOIN contracts c ON c.id = o.contract_id
         WHERE c.org_id = $1
           AND o.type = 'payment'
           AND o.due_date <= NOW() + INTERVAL '30 days'
           AND o.status = 'pending'
           AND c.document_type = 'contract'`,
        [orgId]
      ),
      // Upcoming billing receivables (payment type, due in 30 days, bills only)
      query(
        `SELECT COUNT(*) AS count
         FROM obligations o
         JOIN contracts c ON c.id = o.contract_id
         WHERE c.org_id = $1
           AND o.type = 'payment'
           AND o.due_date <= NOW() + INTERVAL '30 days'
           AND o.status = 'pending'
           AND c.document_type = 'bill'`,
        [orgId]
      ),
      // Spend by contract_type (contracts only)
      query(
        `SELECT contract_type AS category, COALESCE(SUM(value), 0) AS amount
         FROM contracts
         WHERE org_id = $1 AND status NOT IN ('terminated') AND document_type = 'contract'
         GROUP BY contract_type
         ORDER BY amount DESC`,
        [orgId]
      ),
      // Contract status breakdown (contracts only)
      query(
        `SELECT INITCAP(status) AS status, COUNT(*) AS count
         FROM contracts
         WHERE org_id = $1 AND document_type = 'contract'
         GROUP BY status`,
        [orgId]
      ),
      // Recent pending obligations (both)
      query(
        `SELECT o.id, o.contract_id AS "contractId", o.type, o.description,
                o.due_date AS "dueDate", o.status, u.full_name AS "assignedTo",
                c.title AS "contractTitle", c.document_type AS "docType"
         FROM obligations o
         JOIN contracts c ON c.id = o.contract_id
         LEFT JOIN users u ON u.id = o.assigned_to
         WHERE c.org_id = $1 AND o.status = 'pending'
         ORDER BY o.due_date ASC
         LIMIT 8`,
        [orgId]
      ),
    ]);

    res.json({
      activeContracts: parseInt(activeContractsRes.rows[0].count),
      activeBills: parseInt(activeBillsRes.rows[0].count),
      totalSpend: parseFloat(totalSpendRes.rows[0].total),
      totalReceivables: parseFloat(totalReceivablesRes.rows[0].total),
      expiringIn30: parseInt(exp30Res.rows[0].count),
      expiringIn90: parseInt(exp90Res.rows[0].count),
      upcomingBilling: parseInt(billingLiabilitiesRes.rows[0].count),
      upcomingReceivables: parseInt(billingReceivablesRes.rows[0].count),
      spendByCategory: categoryRes.rows.map((r) => ({
        category: r.category,
        amount: parseFloat(r.amount),
      })),
      contractStatusBreakdown: statusRes.rows.map((r) => ({
        status: r.status,
        count: parseInt(r.count),
      })),
      recentObligations: obligationsRes.rows,
    });
  } catch (err) {
    console.error('GET /dashboard/stats error:', err);
    res.status(500).json({ error: 'Failed to load dashboard stats.' });
  }
});

module.exports = router;
