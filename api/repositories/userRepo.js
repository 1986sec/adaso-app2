const { getPool } = require('../db');
const bcrypt = require('bcrypt');

async function findByUsernameOrEmail(identifier) {
  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT id, adsoyad, email, kullanici_adi, sifre, telefon FROM users WHERE kullanici_adi=$1 OR email=$1 LIMIT 1',
    [identifier]
  );
  return rows[0] || null;
}

async function findById(id) {
  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT id, adsoyad, email, kullanici_adi, telefon FROM users WHERE id=$1',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ adsoyad, email, kullaniciAdi, sifre, telefon }) {
  const pool = getPool();
  const hash = await bcrypt.hash(sifre, 12);
  const { rows } = await pool.query(
    'INSERT INTO users(adsoyad, email, kullanici_adi, sifre, telefon) VALUES($1,$2,$3,$4,$5) RETURNING id',
    [adsoyad, email, kullaniciAdi, hash, telefon || null]
  );
  return rows[0];
}

async function updateUser(id, fields) {
  const pool = getPool();
  const allowed = ['adsoyad', 'email', 'kullanici_adi', 'telefon'];
  const set = [];
  const values = [];
  let idx = 1;
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      set.push(`${key}=$${idx++}`);
      values.push(fields[key]);
    }
  }
  if (!set.length) {
    const { rows } = await pool.query('SELECT id, adsoyad, email, kullanici_adi, telefon FROM users WHERE id=$1', [id]);
    return rows[0] || null;
  }
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${set.join(',')} WHERE id=$${idx} RETURNING id, adsoyad, email, kullanici_adi, telefon`,
    values
  );
  return rows[0] || null;
}

async function setResetToken(userId, token) {
  const pool = getPool();
  await pool.query('UPDATE users SET reset_token=$1, reset_token_created_at=NOW() WHERE id=$2', [token, userId]);
}

async function findByResetToken(token) {
  const pool = getPool();
  const { rows } = await pool.query('SELECT id FROM users WHERE reset_token=$1', [token]);
  return rows[0] || null;
}

async function updatePassword(userId, newPassword) {
  const pool = getPool();
  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET sifre=$1, reset_token=NULL, reset_token_created_at=NULL WHERE id=$2', [hash, userId]);
}

async function changePassword(userId, oldPassword, newPassword) {
  const pool = getPool();
  const { rows } = await pool.query('SELECT sifre FROM users WHERE id=$1', [userId]);
  if (!rows[0]) return false;
  const ok = await bcrypt.compare(oldPassword, rows[0].sifre);
  if (!ok) return false;
  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET sifre=$1 WHERE id=$2', [hash, userId]);
  return true;
}

module.exports = {
  findByUsernameOrEmail,
  findById,
  createUser,
  updateUser,
  setResetToken,
  findByResetToken,
  updatePassword,
  changePassword,
};


