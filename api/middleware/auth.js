const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  try {
    const headerToken = req.headers['x-auth-token'];
    let tokenString = null;
    const auth = req.headers.authorization || '';
    const [scheme, token] = auth.split(' ');
    if (scheme === 'Bearer' && token) tokenString = token;
    if (!tokenString && headerToken) tokenString = headerToken;
    if (!tokenString) {
      return res.status(401).json({ error: true, message: 'Yetkisiz erişim', code: 'UNAUTHORIZED' });
    }
    const payload = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = { id: payload.id, kullaniciAdi: payload.kullaniciAdi };
    return next();
  } catch (e) {
    return res.status(401).json({ error: true, message: 'Geçersiz veya süresi dolmuş token', code: 'UNAUTHORIZED' });
  }
}

module.exports = { authRequired };


