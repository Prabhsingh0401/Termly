const router = require('express').Router();
router.get('/stats', (req, res) => res.json({ activeContracts: 0, totalSpend: 0, expiringIn30: 0, expiringIn90: 0, upcomingBilling: 0 }));
module.exports = router;
