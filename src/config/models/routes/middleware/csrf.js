const crypto = require('crypto');

const csrfTokens = new Map();

const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
  if (req.method === 'GET') {
    const token = generateCSRFToken();
    csrfTokens.set(token, Date.now() + 3600000); // 1 hour
    res.locals.csrfToken = token;
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token || !csrfTokens.has(token)) {
    return res.status(403).json({ message: 'CSRF token geçersiz' });
  }

  if (csrfTokens.get(token) < Date.now()) {
    csrfTokens.delete(token);
    return res.status(403).json({ message: 'CSRF token süresi dolmuş' });
  }

  csrfTokens.delete(token);
  next();
};

module.exports = { csrfProtection, generateCSRFToken };