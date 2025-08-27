const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const config = require(path.join(__dirname, 'config', 'config.js'));
const { connectDB, checkConnection } = require(path.join(__dirname, 'config', 'db.js'));

// Import middleware
const { securityMiddleware, generalRateLimiter } = require('./middleware/security');
const { requestLogger, errorLogger } = require('./middleware/logging');

// Import Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require(path.join(__dirname, 'config', 'swagger.js'));
const { initSchema } = require('./config/schema');

const app = express();
const PORT = config.port;

// Connect to Postgres (Supabase)
connectDB().then(() => initSchema().catch(err => {
    console.error('Schema init failed', err);
    process.exit(1);
}));

// Security middleware
app.use(securityMiddleware);

// Rate limiting
app.use(generalRateLimiter);

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// CORS - only allow FRONTEND_ORIGIN
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
if (process.env.STORAGE_PROVIDER === 'local') {
    app.use('/uploads', express.static('uploads'));
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const firmalarRoutes = require('./routes/firmalar');
const ziyaretlerRoutes = require('./routes/ziyaretler');
const gelirGiderRoutes = require('./routes/gelirGider');
const searchRoutes = require('./routes/search');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/firmalar', firmalarRoutes);
app.use('/api/ziyaretler', ziyaretlerRoutes);
app.use('/api/gelir-gider', gelirGiderRoutes);
app.use('/api/search', searchRoutes);

// Base URL: /api

// Remove dev-only Mongo-specific routes

// Health check route per spec
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: checkConnection() ? 'Connected' : 'Disconnected',
        version: '1.0.0',
        environment: config.nodeEnv
    });
});

// 404 handler with error format
app.use('*', (req, res) => {
    res.status(404).json({ error: true, message: 'Route bulunamadı', code: 'NOT_FOUND' });
});

// Error logging
app.use(errorLogger);

// Global error handler with unified format
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const status = err.status || 500;
    res.status(status).json({
        error: true,
        message: err.message || 'Sunucu hatası oluştu',
        code: err.code || 'INTERNAL_ERROR'
    });
});

// app exported; listening handled by server.js

module.exports = app;