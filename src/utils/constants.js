// API Constants
const API_CONSTANTS = {
  VERSION: 'v1',
  PREFIX: '/api',
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
  VIEWER: 'viewer'
};

// Company Status
const COMPANY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PROSPECT: 'prospect',
  SUSPENDED: 'suspended'
};

// Visit Status
const VISIT_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed'
};

// Visit Types
const VISIT_TYPES = {
  REGULAR: 'regular',
  SPECIAL: 'special',
  FOLLOW_UP: 'follow-up',
  SALES: 'sales',
  SUPPORT: 'support'
};

// Transaction Types
const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Payment Methods
const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  CHECK: 'check',
  MOBILE_PAYMENT: 'mobile_payment',
  OTHER: 'other'
};

// File Types and Extensions
const FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  SPREADSHEET: 'spreadsheet',
  PRESENTATION: 'presentation',
  ARCHIVE: 'archive'
};

const ALLOWED_EXTENSIONS = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  DOCUMENT: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  SPREADSHEET: ['.xls', '.xlsx', '.csv'],
  PRESENTATION: ['.ppt', '.pptx'],
  ARCHIVE: ['.zip', '.rar', '.7z']
};

const MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt'
};

// Business Sectors
const SECTORS = {
  TECHNOLOGY: 'Technology',
  MANUFACTURING: 'Manufacturing',
  SERVICES: 'Services',
  HEALTHCARE: 'Healthcare',
  FINANCE: 'Finance',
  EDUCATION: 'Education',
  RETAIL: 'Retail',
  CONSTRUCTION: 'Construction',
  TRANSPORTATION: 'Transportation',
  ENERGY: 'Energy',
  OTHER: 'Other'
};

// Priority Levels
const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Notification Types
const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
};

// Time Constants
const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
};

// Database Constants
const DB_CONSTANTS = {
  MAX_POOL_SIZE: 10,
  SERVER_SELECTION_TIMEOUT: 5000,
  SOCKET_TIMEOUT: 45000,
  CONNECTION_TIMEOUT: 10000,
  MAX_IDLE_TIME: 30000
};

// Security Constants
const SECURITY_CONSTANTS = {
  BCRYPT_ROUNDS: 12,
  JWT_EXPIRY: '7d',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128
};

// Rate Limiting Constants
const RATE_LIMIT_CONSTANTS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 5,
  UPLOAD_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  UPLOAD_MAX_REQUESTS: 10
};

// Logging Constants
const LOGGING_CONSTANTS = {
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss'
};

// File Upload Constants
const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ALLOWED_MIME_TYPES: Object.keys(MIME_TYPES),
  UPLOAD_PATH: './uploads',
  TEMP_PATH: './temp'
};

// Pagination Constants
const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

// Cache Constants
const CACHE_CONSTANTS = {
  DEFAULT_TTL: 300, // 5 minutes
  USER_CACHE_TTL: 600, // 10 minutes
  STATS_CACHE_TTL: 1800, // 30 minutes
  REPORT_CACHE_TTL: 3600 // 1 hour
};

// Email Constants
const EMAIL_CONSTANTS = {
  TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password_reset',
    VERIFICATION: 'verification',
    NOTIFICATION: 'notification'
  },
  SUBJECTS: {
    WELCOME: 'Welcome to ADASO',
    PASSWORD_RESET: 'Password Reset Request',
    VERIFICATION: 'Email Verification',
    NOTIFICATION: 'New Notification'
  }
};

module.exports = {
  API_CONSTANTS,
  HTTP_STATUS,
  USER_ROLES,
  COMPANY_STATUS,
  VISIT_STATUS,
  VISIT_TYPES,
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
  FILE_TYPES,
  ALLOWED_EXTENSIONS,
  MIME_TYPES,
  SECTORS,
  PRIORITY_LEVELS,
  NOTIFICATION_TYPES,
  TIME_CONSTANTS,
  DB_CONSTANTS,
  SECURITY_CONSTANTS,
  RATE_LIMIT_CONSTANTS,
  LOGGING_CONSTANTS,
  UPLOAD_CONSTANTS,
  PAGINATION_CONSTANTS,
  CACHE_CONSTANTS,
  EMAIL_CONSTANTS
};
