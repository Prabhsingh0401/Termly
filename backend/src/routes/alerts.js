const router = require('express').Router();
router.get('/', (req, res) => res.json({ data: [], message: 'alerts stub' }));
module.exports = router;
