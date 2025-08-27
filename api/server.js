const express = require('express');
const dns = require('dns');
// Prefer IPv4 to avoid IPv6 connectivity issues in some Docker environments
try { dns.setDefaultResultOrder('ipv4first'); } catch (_) {}
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDb, getPool, checkConnection } = require('./db');
const { errorHandler } = require('./middleware/error');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  JWT_SECRET is not set.');
}
if (!FRONTEND_ORIGIN) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  FRONTEND_ORIGIN is not set.');
}

// Database init (create tables if not exist)
initDb().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('DB init failed:', err);
  // Don't exit; keep app running so health can report Disconnected and DB may become reachable later
});

// Security
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS: only frontend origin
app.use(
  cors({
    origin: FRONTEND_ORIGIN || false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);

// Logging
app.use(morgan('combined'));

// Rate limits
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use(globalLimiter);

// Health
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: checkConnection() ? 'Connected' : 'Disconnected',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const firmalarRoutes = require('./routes/firmalar');
const ziyaretlerRoutes = require('./routes/ziyaretler');
const gelirGiderRoutes = require('./routes/gelirGider');
const searchRoutes = require('./routes/search');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/firmalar', firmalarRoutes);
app.use('/api/ziyaretler', ziyaretlerRoutes);
app.use('/api/gelir-gider', gelirGiderRoutes);
app.use('/api/search', searchRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: true, message: 'Route bulunamadı', code: 'NOT_FOUND' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 ADASO API Server running on http://localhost:${PORT}`);
});

module.exports = app;


