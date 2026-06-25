const router = require('express').Router();
router.get('/', (req, res) => res.json({ data: [], message: 'vendors stub' }));
router.post('/', (req, res) => res.json({ message: 'create vendor stub' }));
router.get('/:id', (req, res) => res.json({ message: 'get vendor stub' }));
module.exports = router;
