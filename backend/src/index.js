require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use('/api', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',       require('./routes/auth'));
app.use('/api/v1/contracts',  require('./routes/contracts'));
app.use('/api/v1/vendors',    require('./routes/vendors'));
app.use('/api/v1/obligations',require('./routes/obligations'));
app.use('/api/v1/dashboard',  require('./routes/dashboard'));
app.use('/api/v1/search',     require('./routes/search'));
app.use('/api/v1/alerts',     require('./routes/alerts'));
app.use('/api/v1/audit-logs', require('./routes/auditLogs'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Termly API running on http://localhost:${PORT}`);
});

module.exports = app;
