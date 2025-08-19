// Load environment variables
if (process.env.NODE_ENV === 'production') {
  require('dotenv-vault').config();
} else {
  require('dotenv').config();
}

const config = {
  // Server Configuration
  port: process.env.PORT || 7000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/adaso_db',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'adaso_super_secret_jwt_key_2024',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  },
  
  // Frontend Configuration
  frontendUrl: process.env.FRONTEND_URL || 'https://adaso.net',
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },
  
  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || null
  },

  // Security Configuration
  security: {
    bcryptRounds: 12,
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // max 100 requests per window
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['https://adaso.net', 'http://localhost:3000', 'http://localhost:3001']
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILENAME || 'adaso-backend.log'
  },
  
  // Database Configuration
  database: {
    connectionOptions: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  }
};

// Validation
if (!config.jwtSecret || config.jwtSecret === 'adaso_super_secret_jwt_key_2024') {
  console.warn('⚠️  Warning: Using default JWT secret. Please set JWT_SECRET in production.');
}

if (config.nodeEnv === 'production') {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in production');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Warning: Email credentials not set. Email functionality will not work.');
  }
}

module.exports = config;
