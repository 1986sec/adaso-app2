const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const config = require('../config/config');
const { success, error } = require('../utils/responses');
const { authRateLimiter } = require('../middleware/security');

const router = express.Router();

router.use(authRateLimiter);

router.post('/register', async (req, res) => {
  try {
    const { adsoyad, email, kullaniciAdi, sifre, telefon } = req.body || {};
    if (!adsoyad || !email || !kullaniciAdi || !sifre || sifre.length < 6) {
      return error(res, 'Geçersiz alanlar', 'VALIDATION_ERROR', 400);
    }
    const pool = getPool();
    const exists = await pool.query('SELECT 1 FROM "Kullanici" WHERE email=$1 OR kullaniciAdi=$2', [email, kullaniciAdi]);
    if (exists.rowCount > 0) return res.status(409).json({ error: true, message: 'Kullanıcı zaten var', code: 'USER_EXISTS' });
    const hash = await bcrypt.hash(sifre, 12);
    await pool.query('INSERT INTO "Kullanici" (adsoyad,email,kullaniciAdi,sifre,telefon) VALUES ($1,$2,$3,$4,$5)', [adsoyad, email, kullaniciAdi, hash, telefon || null]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return error(res, 'Sunucu hatası', 'INTERNAL_ERROR', 500);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { kullaniciAdi, sifre } = req.body || {};
    const pool = getPool();
    const r = await pool.query('SELECT id, adsoyad, email, kullaniciAdi, sifre FROM "Kullanici" WHERE kullaniciAdi=$1 OR email=$1', [kullaniciAdi]);
    if (r.rowCount === 0) return error(res, 'Yetkisiz', 'UNAUTHORIZED', 401);
    const user = r.rows[0];
    const match = await bcrypt.compare(sifre, user.sifre);
    if (!match) return error(res, 'Yetkisiz', 'UNAUTHORIZED', 401);
    const token = jwt.sign({ id: user.id, kullaniciAdi: user.kullaniciAdi }, config.jwtSecret, { expiresIn: config.jwtExpire || '7d' });
    return res.status(200).json({ token: `Bearer ${token}`, user: { id: user.id, kullaniciAdi: user.kullaniciAdi, adsoyad: user.adsoyad, email: user.email } });
  } catch (e) {
    return error(res, 'Sunucu hatası', 'INTERNAL_ERROR', 500);
  }
});

router.post('/forgot', async (req, res) => {
  return res.status(200).json({ ok: true });
});

router.post('/reset', async (req, res) => {
  return res.status(200).json({ ok: true });
});

router.post('/change-password', async (req, res) => {
  try {
    const header = req.headers['authorization'] || '';
    const raw = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!raw) return res.status(401).end();
    let payload;
    try { payload = jwt.verify(raw, config.jwtSecret); } catch { return res.status(401).end(); }
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword || newPassword.length < 6) return error(res, 'Geçersiz istek', 'VALIDATION_ERROR', 400);
    const pool = getPool();
    const r = await pool.query('SELECT sifre FROM "Kullanici" WHERE id=$1', [payload.id]);
    if (r.rowCount === 0) return error(res, 'Bulunamadı', 'NOT_FOUND', 404);
    const match = await bcrypt.compare(oldPassword, r.rows[0].sifre);
    if (!match) return error(res, 'Yetkisiz', 'UNAUTHORIZED', 401);
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE "Kullanici" SET sifre=$1 WHERE id=$2', [hash, payload.id]);
    return res.json({ ok: true });
  } catch (e) {
    return error(res, 'Sunucu hatası', 'INTERNAL_ERROR', 500);
  }
});

module.exports = router;


