const router = require('express').Router();
const { query } = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET / — List vendors with active contract count
router.get('/', async (req, res) => {
  try {
    const { orgId } = req.user;
    const result = await query(
      `SELECT v.*,
         COUNT(c.id) FILTER (WHERE c.status IN ('active','expiring')) AS active_contract_count
       FROM vendors v
       LEFT JOIN contracts c ON c.vendor_id = v.id
       WHERE v.org_id = $1
       GROUP BY v.id
       ORDER BY v.name ASC`,
      [orgId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('GET /vendors error:', err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// POST / — Create vendor
router.post('/', async (req, res) => {
  try {
    const { orgId } = req.user;
    const { name, category, country, contact_email, risk_score } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const result = await query(
      `INSERT INTO vendors (org_id, name, category, country, contact_email, risk_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [orgId, name, category || null, country || null, contact_email || null, risk_score || null]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('POST /vendors error:', err);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// GET /:id — Get vendor + aggregated stats + linked contracts
router.get('/:id', async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    const vendorResult = await query(
      `SELECT v.*,
         COUNT(c.id) FILTER (WHERE c.status IN ('active','expiring')) AS active_contracts,
         COALESCE(SUM(c.value) FILTER (WHERE c.status NOT IN ('terminated')), 0) AS total_spend
       FROM vendors v
       LEFT JOIN contracts c ON c.vendor_id = v.id
       WHERE v.id = $1 AND v.org_id = $2
       GROUP BY v.id`,
      [id, orgId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const contractsResult = await query(
      `SELECT * FROM contracts
       WHERE vendor_id = $1 AND org_id = $2
       ORDER BY end_date ASC NULLS LAST`,
      [id, orgId]
    );

    res.json({ vendor: vendorResult.rows[0], contracts: contractsResult.rows });
  } catch (err) {
    console.error('GET /vendors/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// PATCH /:id — Update vendor
router.patch('/:id', async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;
    const { name, category, country, contact_email, risk_score } = req.body;

    const result = await query(
      `UPDATE vendors
       SET name         = COALESCE($1, name),
           category     = COALESCE($2, category),
           country      = COALESCE($3, country),
           contact_email = COALESCE($4, contact_email),
           risk_score   = COALESCE($5, risk_score)
       WHERE id = $6 AND org_id = $7
       RETURNING *`,
      [name, category, country, contact_email, risk_score, id, orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('PATCH /vendors/:id error:', err);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// DELETE /:id — Delete vendor from DB
router.delete('/:id', async (req, res) => {
  try {
    const { orgId } = req.user;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM vendors
       WHERE id = $1 AND org_id = $2 RETURNING id`,
      [id, orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json({ message: 'Vendor deleted successfully', id });
  } catch (err) {
    console.error('DELETE /vendors/:id error:', err);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

module.exports = router;
