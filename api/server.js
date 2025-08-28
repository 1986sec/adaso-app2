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

// Trust proxy for Render/Heroku environments - but be careful with rate limiting
app.set('trust proxy', 1); // Only trust first proxy

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  JWT_SECRET is not set, using default secret.');
  process.env.JWT_SECRET = 'adaso-super-secret-jwt-key-2024-change-in-production';
}
if (!FRONTEND_ORIGIN) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  FRONTEND_ORIGIN is not set.');
}

// Try to read npm debug log if exists
const fs = require('fs');
const logPath = '/home/nodejs/.npm/_logs/2025-08-27T16_18_50_400Z-debug-0.log';
try {
  if (fs.existsSync(logPath)) {
    const logContent = fs.readFileSync(logPath, 'utf8');
    console.log('🔍 Debug Log Found:', logContent);
  }
} catch (err) {
  console.log('📝 No debug log found or cannot read:', err.message);
}

// Database init (create tables if not exist) - with retry logic
async function initializeDatabase() {
  let retries = 3;
  while (retries > 0) {
    try {
      await initDb();
      console.log('🎉 Veritabanı başarıyla başlatıldı!');
      return;
    } catch (err) {
      console.error(`❌ DB init failed (${retries} retries left):`, err.message);
      retries--;
      if (retries > 0) {
        console.log(`🔄 ${retries} saniye sonra tekrar deneniyor...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  console.error('💥 Veritabanı başlatılamadı, uygulama devam ediyor...');
}

initializeDatabase();

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

// Rate limits - with proper IP handling for Render
const authLimiter = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 10, 
  standardHeaders: true, 
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress
});
const globalLimiter = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress
});
app.use(globalLimiter);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'ADASO API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/user',
      firmalar: '/api/firmalar',
      ziyaretler: '/api/ziyaretler',
      gelirGider: '/api/gelir-gider',
      search: '/api/search'
    }
  });
});

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

// Async server startup to handle DB init properly
async function startServer() {
  try {
    const port = process.env.PORT || 10000;
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 ADASO API Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${port}/api/health`);
      console.log(`🔗 Render URL: https://adaso-backend.onrender.com`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;


