const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getPool } = require('../config/db');
const config = require('../config/config');
const { success, error } = require('../utils/responses');

const router = express.Router();

function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).end();
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (e) {
    return res.status(401).end();
  }
}

router.get('/profile', requireAuth, async (req, res) => {
  const pool = getPool();
  const r = await pool.query('SELECT id, adsoyad, email, kullaniciAdi, telefon FROM "Kullanici" WHERE id=$1', [req.user.id]);
  if (r.rowCount === 0) return error(res, 'Bulunamadı', 'NOT_FOUND', 404);
  return res.json(r.rows[0]);
});

router.put('/profile', requireAuth, async (req, res) => {
  const { adsoyad, email, kullaniciAdi, telefon } = req.body || {};
  const pool = getPool();
  const r = await pool.query(
    'UPDATE "Kullanici" SET adsoyad=COALESCE($1, adsoyad), email=COALESCE($2,email), kullaniciAdi=COALESCE($3,kullaniciAdi), telefon=COALESCE($4,telefon) WHERE id=$5 RETURNING id, adsoyad, email, kullaniciAdi, telefon',
    [adsoyad ?? null, email ?? null, kullaniciAdi ?? null, telefon ?? null, req.user.id]
  );
  return res.json(r.rows[0]);
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword || newPassword.length < 6) return error(res, 'Geçersiz istek', 'VALIDATION_ERROR', 400);
  const pool = getPool();
  const r = await pool.query('SELECT sifre FROM "Kullanici" WHERE id=$1', [req.user.id]);
  if (r.rowCount === 0) return error(res, 'Bulunamadı', 'NOT_FOUND', 404);
  const match = await bcrypt.compare(oldPassword, r.rows[0].sifre);
  if (!match) return error(res, 'Yetkisiz', 'UNAUTHORIZED', 401);
  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE "Kullanici" SET sifre=$1 WHERE id=$2', [hash, req.user.id]);
  return res.json({ ok: true });
});

module.exports = router;


