const router = require('express').Router();
router.get('/', (req, res) => res.json({ results: [], message: 'search stub' }));
module.exports = router;
