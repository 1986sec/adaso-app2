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
  const r = await getPool().query('SELECT id, firmaAdi, sektor, telefon, email, yetkiliKisi, yetkiliNumara, adres FROM "Firma" ORDER BY id DESC');
  res.json(r.rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { firmaAdi, sektor, telefon, email, yetkiliKisi, yetkiliNumara, adres } = req.body || {};
  const r = await getPool().query(
    'INSERT INTO "Firma" (firmaAdi,sektor,telefon,email,yetkiliKisi,yetkiliNumara,adres) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [firmaAdi, sektor, telefon, email || null, yetkiliKisi || null, yetkiliNumara || null, adres || null]
  );
  res.json(r.rows[0]);
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { firmaAdi, sektor, telefon, email, yetkiliKisi, yetkiliNumara, adres } = req.body || {};
  const r = await getPool().query(
    'UPDATE "Firma" SET firmaAdi=COALESCE($1,firmaAdi), sektor=COALESCE($2,sektor), telefon=COALESCE($3,telefon), email=COALESCE($4,email), yetkiliKisi=COALESCE($5,yetkiliKisi), yetkiliNumara=COALESCE($6,yetkiliNumara), adres=COALESCE($7,adres) WHERE id=$8 RETURNING *',
    [firmaAdi ?? null, sektor ?? null, telefon ?? null, email ?? null, yetkiliKisi ?? null, yetkiliNumara ?? null, adres ?? null, id]
  );
  res.json(r.rows[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  await getPool().query('DELETE FROM "Firma" WHERE id=$1', [id]);
  res.json({ ok: true });
});

module.exports = router;


