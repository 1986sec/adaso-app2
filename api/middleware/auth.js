const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  try {
    // Check for token in multiple places
    let tokenString = null;
    
    // 1. Check Authorization header (Bearer token)
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) {
      tokenString = auth.substring(7);
    }
    
    // 2. Check x-auth-token header
    if (!tokenString && req.headers['x-auth-token']) {
      tokenString = req.headers['x-auth-token'];
    }
    
    // 3. Check for token without Bearer prefix
    if (!tokenString && auth && !auth.startsWith('Bearer ')) {
      tokenString = auth;
    }
    
    if (!tokenString) {
      return res.status(401).json({ error: true, message: 'Yetkisiz erişim - Token bulunamadı', code: 'UNAUTHORIZED' });
    }
    
    // Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: true, message: 'Sunucu yapılandırma hatası', code: 'INTERNAL_ERROR' });
    }
    
    const payload = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = { id: payload.id, kullaniciAdi: payload.kullaniciAdi };
    return next();
  } catch (e) {
    console.error('JWT verification error:', e.message);
    return res.status(401).json({ error: true, message: 'Geçersiz veya süresi dolmuş token', code: 'UNAUTHORIZED' });
  }
}

module.exports = { authRequired };


