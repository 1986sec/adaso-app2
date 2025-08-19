const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { 
      status: 'error',
      message: message || 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message: message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General rate limiter
const generalRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // max 100 requests per window
  'Too many requests, please try again later.'
);

// Auth rate limiter (more strict)
const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // max 5 requests per window
  'Too many authentication attempts, please try again later.'
);

// Upload rate limiter
const uploadRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // max 10 uploads per hour
  'Too many file uploads, please try again later.'
);

// IP blocking
const blockedIPs = new Set();

const ipBlocker = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (blockedIPs.has(clientIP)) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied from this IP address.'
    });
  }
  
  next();
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      status: 'error',
      message: 'Request entity too large. Maximum size is 10MB.'
    });
  }
  
  next();
};

// Content type validation
const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        status: 'error',
        message: 'Unsupported media type. Please send JSON data.'
      });
    }
  }
  
  next();
};

// Method not allowed
const methodNotAllowed = (req, res) => {
  res.status(405).json({
    status: 'error',
    message: `Method ${req.method} not allowed for ${req.originalUrl}`
  });
};

// Security middleware composition
const securityMiddleware = [
  securityHeaders,
  ipBlocker,
  requestSizeLimiter,
  validateContentType
];

module.exports = {
  securityHeaders,
  createRateLimiter,
  generalRateLimiter,
  authRateLimiter,
  uploadRateLimiter,
  ipBlocker,
  requestSizeLimiter,
  validateContentType,
  methodNotAllowed,
  securityMiddleware,
  blockedIPs
};
