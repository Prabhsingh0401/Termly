const router = require('express').Router();
router.get('/', (req, res) => res.json({ data: [], message: 'contracts stub' }));
router.post('/', (req, res) => res.json({ message: 'create contract stub' }));
router.get('/:id', (req, res) => res.json({ message: 'get contract stub' }));
router.patch('/:id', (req, res) => res.json({ message: 'update contract stub' }));
router.delete('/:id', (req, res) => res.json({ message: 'delete contract stub' }));
router.get('/:id/extract-status', (req, res) => res.json({ status: 'pending' }));
module.exports = router;
