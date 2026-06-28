const router = require('express').Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET / — list pending contracts awaiting approval
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { orgId } = req.user;

    const result = await db.query(
      `SELECT c.*, v.name AS vendor_name, u.full_name AS created_by_name
       FROM contracts c
       LEFT JOIN vendors v ON v.id = c.vendor_id
       LEFT JOIN users u ON u.id = c.created_by
       WHERE c.org_id = $1 AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [orgId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /:contractId/approve — approve or reject a pending contract
router.post('/:contractId/approve', authMiddleware, async (req, res, next) => {
  try {
    const { orgId, id: userId } = req.user;
    const { contractId } = req.params;
    const { decision, comment = '' } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be "approved" or "rejected"' });
    }

    // Fetch current contract for audit old_value
    const contractResult = await db.query(
      `SELECT * FROM contracts WHERE id = $1 AND org_id = $2`,
      [contractId, orgId]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const oldStatus = contractResult.rows[0].status;
    const newStatus = decision === 'approved' ? 'active' : 'draft';

    // Update contract status
    const updated = await db.query(
      `UPDATE contracts
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND org_id = $3
       RETURNING *`,
      [newStatus, contractId, orgId]
    );

    // Insert audit log
    await db.query(
      `INSERT INTO audit_logs (org_id, user_id, action, entity_type, entity_id, old_value, new_value)
       VALUES ($1, $2, 'approval_decision', 'contract', $3, $4, $5)`,
      [
        orgId,
        userId,
        contractId,
        JSON.stringify({ status: oldStatus }),
        JSON.stringify({ status: newStatus, decision, comment }),
      ]
    );

    res.json({ message: 'Decision recorded', contract: updated.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
