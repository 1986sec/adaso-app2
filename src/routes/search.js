const express = require('express');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const config = require('../config/config');

const router = express.Router();

function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).end();
  try { req.user = jwt.verify(token, config.jwtSecret); next(); } catch { return res.status(401).end(); }
}

router.get('/', requireAuth, async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const pool = getPool();
  const [firmalar, ziyaretler, finans] = await Promise.all([
    pool.query('SELECT firmaAdi, sektor FROM "Firma" WHERE LOWER(firmaAdi) LIKE $1 OR LOWER(sektor) LIKE $1 LIMIT 20', [`%${q}%`]),
    pool.query('SELECT tarih, firma, amac, durum FROM "Ziyaret" WHERE LOWER(firma) LIKE $1 OR LOWER(amac) LIKE $1 LIMIT 20', [`%${q}%`]),
    pool.query('SELECT tarih, aciklama, tur, tutar FROM "GelirGider" WHERE LOWER(aciklama) LIKE $1 LIMIT 20', [`%${q}%`])
  ]);
  const data = [];
  firmalar.rows.forEach(f => data.push({ date: '', name: f.firmaAdi, detail: f.sektor, status: 'firma', type: 'Firma' }));
  ziyaretler.rows.forEach(z => data.push({ date: z.tarih, name: z.firma, detail: z.amac, status: z.durum === 'Planlandı' ? 'planlandı' : (z.durum === 'Tamamlandı' ? 'görüşme-yapılan' : 'ziyaret-edilmedi'), type: 'Ziyaret' }));
  finans.rows.forEach(g => data.push({ date: g.tarih, name: g.aciklama, detail: `${g.tutar} ₺`, status: g.tur === 'Gelir' ? 'gelir' : 'gider', type: g.tur }));
  res.json(data);
});

router.get('/suggestions', requireAuth, async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const pool = getPool();
  const [f1, f2, z1, g1] = await Promise.all([
    pool.query('SELECT DISTINCT firmaAdi AS s FROM "Firma" WHERE LOWER(firmaAdi) LIKE $1 LIMIT 10', [`%${q}%`]),
    pool.query('SELECT DISTINCT sektor AS s FROM "Firma" WHERE LOWER(sektor) LIKE $1 LIMIT 10', [`%${q}%`]),
    pool.query('SELECT DISTINCT ziyaretci AS s FROM "Ziyaret" WHERE LOWER(ziyaretci) LIKE $1 LIMIT 10', [`%${q}%`]),
    pool.query('SELECT DISTINCT aciklama AS s FROM "GelirGider" WHERE LOWER(aciklama) LIKE $1 LIMIT 10', [`%${q}%`])
  ]);
  const suggestions = Array.from(new Set([...f1.rows, ...f2.rows, ...z1.rows, ...g1.rows].map(r => r.s))).slice(0, 20);
  res.json(suggestions);
});

module.exports = router;


