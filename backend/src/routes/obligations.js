const router = require('express').Router();
router.get('/', (req, res) => res.json({ data: [], message: 'obligations stub' }));
router.post('/', (req, res) => res.json({ message: 'create obligation stub' }));
router.patch('/:id', (req, res) => res.json({ message: 'update obligation stub' }));
module.exports = router;
