const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config/config.js');
const connectDB = require('./config/db');

// Import middleware
const { securityMiddleware, generalRateLimiter } = require('./middleware/security');
const { requestLogger, errorLogger } = require('./middleware/logging');
const { initRedis } = require('./middleware/cache');

// Import Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();
const PORT = config.port;

// Connect to MongoDB
connectDB();

// Initialize Redis
initRedis();

// Security middleware
app.use(securityMiddleware);

// Rate limiting
app.use(generalRateLimiter);

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// CORS ayarları - Netlify frontend için
app.use(cors({
    origin: [
        'https://adaso.net',           // Netlify domain
        'https://adaso.netlify.app',   // Alternatif domain
        'http://localhost:3000',       // Local development
        'http://localhost:3001'        // Local development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
});
app.use(express.json({ limit: config.upload.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize }));
app.use('/uploads', express.static('uploads'));

// Import routes
const authRoutes = require('./config/models/routes/auth');
const companyRoutes = require('./config/models/routes/companies');
const visitRoutes = require('./config/models/routes/visits');
const transactionRoutes = require('./config/models/routes/transactions');
const reportRoutes = require('./config/models/routes/reports');
const uploadRoutes = require('./config/models/routes/upload');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API çalışıyor!', timestamp: new Date() });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        database: 'Connected',
        version: '1.0.0',
        environment: config.nodeEnv
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route bulunamadı' });
});

// Error logging
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            message: 'Validation Error', 
            errors: Object.values(err.errors).map(e => e.message) 
        });
    }
    
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Geçersiz ID formatı' });
    }
    
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Bu kayıt zaten mevcut' });
    }
    
    res.status(err.status || 500).json({ 
        message: err.message || 'Sunucu hatası oluştu' 
    });
});

if (require.main === module) {
  app.listen(PORT, () => {
    const serverUrl = config.nodeEnv === 'production' 
      ? 'https://adaso-backend.onrender.com' 
      : `http://localhost:${PORT}`;
    
    console.log(`🚀 ADASO API Server running on ${serverUrl}`);
    console.log(`📊 Database: ${config.nodeEnv === 'production' ? 'MongoDB Atlas' : 'Mock Mode'}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔐 JWT Secret: ${config.jwtSecret ? 'Set' : 'Default'}`);
    console.log(`📧 Email: ${config.email.user !== 'your-email@gmail.com' ? 'Configured' : 'Not configured'}`);
    console.log(`✅ Server started successfully!`);
  });
}

module.exports = app;