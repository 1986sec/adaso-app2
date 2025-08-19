const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// User validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Company validation
const validateCompany = [
  body('companyName')
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),
  body('contactPerson')
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact person name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('sector')
    .isIn(['Technology', 'Manufacturing', 'Services', 'Healthcare', 'Finance', 'Education', 'Retail', 'Other'])
    .withMessage('Please select a valid sector'),
  body('status')
    .isIn(['active', 'inactive', 'prospect'])
    .withMessage('Please select a valid status'),
  handleValidationErrors
];

// Visit validation
const validateVisit = [
  body('company')
    .isMongoId()
    .withMessage('Please provide a valid company ID'),
  body('visitDate')
    .isISO8601()
    .withMessage('Please provide a valid visit date'),
  body('visitType')
    .isIn(['regular', 'special'])
    .withMessage('Please select a valid visit type'),
  body('status')
    .isIn(['planned', 'completed', 'cancelled'])
    .withMessage('Please select a valid status'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors
];

// Transaction validation
const validateTransaction = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Please select a valid transaction type'),
  body('category')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid transaction date'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'bank_transfer', 'credit_card', 'check', 'other'])
    .withMessage('Please select a valid payment method'),
  handleValidationErrors
];

// ID validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid ID'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCompany,
  validateVisit,
  validateTransaction,
  validateId,
  validatePagination,
  validateDateRange
};
