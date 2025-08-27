const { getPool } = require('../db');

async function listCompanies() {
  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT id, firma_adi AS "firmaAdi", sektor, telefon, email, yetkili_kisi AS "yetkiliKisi", yetkili_numara AS "yetkiliNumara", adres FROM firmalar ORDER BY id DESC'
  );
  return rows;
}

async function createCompany(payload) {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO firmalar (firma_adi, sektor, telefon, email, yetkili_kisi, yetkili_numara, adres)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, firma_adi AS "firmaAdi", sektor, telefon, email, yetkili_kisi AS "yetkiliKisi", yetkili_numara AS "yetkiliNumara", adres`,
    [payload.firmaAdi, payload.sektor, payload.telefon, payload.email || null, payload.yetkiliKisi || null, payload.yetkiliNumara || null, payload.adres || null]
  );
  return rows[0];
}

async function findCompanyById(id) {
  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT id, firma_adi AS "firmaAdi", sektor, telefon, email, yetkili_kisi AS "yetkiliKisi", yetkili_numara AS "yetkiliNumara", adres FROM firmalar WHERE id=$1',
    [id]
  );
  return rows[0] || null;
}

async function updateCompany(id, fields) {
  const pool = getPool();
  const map = {
    firmaAdi: 'firma_adi',
    sektor: 'sektor',
    telefon: 'telefon',
    email: 'email',
    yetkiliKisi: 'yetkili_kisi',
    yetkiliNumara: 'yetkili_numara',
    adres: 'adres',
  };
  const set = [];
  const values = [];
  let idx = 1;
  for (const key of Object.keys(map)) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      set.push(`${map[key]}=$${idx++}`);
      values.push(fields[key]);
    }
  }
  if (!set.length) return findCompanyById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE firmalar SET ${set.join(',')} WHERE id=$${idx}
     RETURNING id, firma_adi AS "firmaAdi", sektor, telefon, email, yetkili_kisi AS "yetkiliKisi", yetkili_numara AS "yetkiliNumara", adres`,
    values
  );
  return rows[0] || null;
}

async function deleteCompany(id) {
  const pool = getPool();
  await pool.query('DELETE FROM firmalar WHERE id=$1', [id]);
}

module.exports = { listCompanies, createCompany, findCompanyById, updateCompany, deleteCompany };


