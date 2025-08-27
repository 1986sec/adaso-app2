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
  const r = await getPool().query('SELECT * FROM "GelirGider" ORDER BY tarih DESC');
  res.json(r.rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { tarih, aciklama, kategori, tur, tutar } = req.body || {};
  const r = await getPool().query(
    'INSERT INTO "GelirGider" (tarih,aciklama,kategori,tur,tutar) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [tarih, aciklama, kategori, tur, tutar]
  );
  res.json(r.rows[0]);
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const fields = ['tarih','aciklama','kategori','tur','tutar'];
  const updates = fields.map((f, i) => `${f}=COALESCE($${i+1}, ${f})`).join(', ');
  const values = fields.map(f => (req.body && req.body[f] !== undefined ? req.body[f] : null));
  values.push(id);
  const r = await getPool().query(`UPDATE "GelirGider" SET ${updates} WHERE id=$${values.length} RETURNING *`, values);
  res.json(r.rows[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  await getPool().query('DELETE FROM "GelirGider" WHERE id=$1', [id]);
  res.json({ ok: true });
});

module.exports = router;


