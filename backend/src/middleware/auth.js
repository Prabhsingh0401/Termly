const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'termly_super_secret_key_change_in_production';

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      orgId: decoded.orgId,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (err) {
    console.warn('⚠️ Invalid token received:', err.message);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
