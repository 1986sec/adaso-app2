const { getPool } = require('../db');

async function listAll() {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, to_char(tarih,'YYYY-MM-DD') as tarih, aciklama, kategori, tur, tutar FROM gelir_gider ORDER BY id DESC`
  );
  return rows;
}

async function createOne(payload) {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO gelir_gider (tarih, aciklama, kategori, tur, tutar)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, to_char(tarih,'YYYY-MM-DD') as tarih, aciklama, kategori, tur, tutar`,
    [payload.tarih, payload.aciklama, payload.kategori, payload.tur, payload.tutar]
  );
  return rows[0];
}

async function findById(id) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, to_char(tarih,'YYYY-MM-DD') as tarih, aciklama, kategori, tur, tutar FROM gelir_gider WHERE id=$1`,
    [id]
  );
  return rows[0] || null;
}

async function updateOne(id, fields) {
  const pool = getPool();
  const map = { tarih: 'tarih', aciklama: 'aciklama', kategori: 'kategori', tur: 'tur', tutar: 'tutar' };
  const set = [];
  const values = [];
  let idx = 1;
  for (const key of Object.keys(map)) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      set.push(`${map[key]}=$${idx++}`);
      values.push(fields[key]);
    }
  }
  if (!set.length) return findById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE gelir_gider SET ${set.join(',')} WHERE id=$${idx}
     RETURNING id, to_char(tarih,'YYYY-MM-DD') as tarih, aciklama, kategori, tur, tutar`,
    values
  );
  return rows[0] || null;
}

async function deleteOne(id) {
  const pool = getPool();
  await pool.query('DELETE FROM gelir_gider WHERE id=$1', [id]);
}

module.exports = { listAll, createOne, findById, updateOne, deleteOne };


