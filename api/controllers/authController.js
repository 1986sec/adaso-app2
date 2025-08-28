const crypto = require('crypto');
const { signToken } = require('../utils/jwt');
const users = require('../repositories/userRepo');

async function register(req, res, next) {
  try {
    const { adsoyad, email, kullaniciAdi, sifre } = req.body || {};
    if (!adsoyad || !email || !kullaniciAdi || !sifre) {
      return res.status(400).json({ error: true, message: 'Eksik alanlar', code: 'VALIDATION_ERROR' });
    }
    if (String(sifre).length < 6) {
      return res.status(400).json({ error: true, message: 'Şifre en az 6 karakter olmalı', code: 'WEAK_PASSWORD' });
    }
    // Kullanıcı adı kontrolü
    const existingUser = await users.findByUsername(kullaniciAdi);
    if (existingUser) {
      return res.status(409).json({ error: true, message: 'Bu kullanıcı adı zaten kullanılıyor', code: 'USERNAME_EXISTS' });
    }
    
    // Email kontrolü
    const existingEmail = await users.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: true, message: 'Bu email adresi zaten kullanılıyor', code: 'EMAIL_EXISTS' });
    }
    await users.createUser({ adsoyad, email, kullaniciAdi, sifre });
    return res.json({ ok: true });
  } catch (e) { return next(e); }
}

async function login(req, res, next) {
  try {
    const { kullaniciAdi, sifre } = req.body || {};
    if (!kullaniciAdi || !sifre) {
      return res.status(400).json({ error: true, message: 'Eksik alanlar', code: 'VALIDATION_ERROR' });
    }
    const user = await users.findByUsernameOrEmail(kullaniciAdi);
    if (!user) {
      return res.status(401).json({ error: true, message: 'Geçersiz bilgiler', code: 'UNAUTHORIZED' });
    }
    const ok = await require('bcrypt').compare(sifre, user.sifre);
    if (!ok) {
      return res.status(401).json({ error: true, message: 'Geçersiz bilgiler', code: 'UNAUTHORIZED' });
    }
    const token = signToken({ id: user.id, kullaniciAdi: user.kullanici_adi });
    return res.json({ token: token, user: { id: user.id, kullaniciAdi: user.kullanici_adi, adsoyad: user.adsoyad, email: user.email } });
  } catch (e) { return next(e); }
}

async function forgot(req, res, next) {
  try {
    const { identifier } = req.body || {};
    if (!identifier) return res.status(400).json({ error: true, message: 'identifier gerekli', code: 'VALIDATION_ERROR' });
    const user = await users.findByUsernameOrEmail(identifier);
    if (user) {
      const token = crypto.randomBytes(24).toString('hex');
      await users.setResetToken(user.id, token);
      // PROD: email gönderimine hazır, response'ta token dönmüyoruz
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        return res.json({ ok: true, resetToken: token });
      }
    }
    return res.json({ ok: true });
  } catch (e) { return next(e); }
}

async function reset(req, res, next) {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ error: true, message: 'Eksik alanlar', code: 'VALIDATION_ERROR' });
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: true, message: 'Şifre en az 6 karakter olmalı', code: 'WEAK_PASSWORD' });
    }
    const row = await users.findByResetToken(token);
    if (!row) return res.status(400).json({ error: true, message: 'Geçersiz veya süresi dolmuş token', code: 'INVALID_TOKEN' });
    await users.updatePassword(row.id, newPassword);
    return res.json({ ok: true });
  } catch (e) { return next(e); }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) return res.status(400).json({ error: true, message: 'Eksik alanlar', code: 'VALIDATION_ERROR' });
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: true, message: 'Şifre en az 6 karakter olmalı', code: 'WEAK_PASSWORD' });
    }
    const ok = await users.changePassword(req.user.id, oldPassword, newPassword);
    if (!ok) return res.status(400).json({ error: true, message: 'Eski şifre yanlış', code: 'INVALID_OLD_PASSWORD' });
    return res.json({ ok: true });
  } catch (e) { return next(e); }
}

module.exports = { register, login, forgot, reset, changePassword };


