const router = require('express').Router();

// POST /api/v1/auth/signup
router.post('/signup', (req, res) => {
  res.json({ message: 'signup stub' });
});

// POST /api/v1/auth/login
router.post('/login', (req, res) => {
  res.json({ message: 'login stub' });
});

module.exports = router;
