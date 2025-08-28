const { getPool } = require('../db');

async function listVisits() {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, to_char(tarih,'YYYY-MM-DD') as tarih, saat, firma, ziyaretci, amac, durum,
            notlar, detayli_bilgi AS "detayliBilgi", katilimcilar, lokasyon, dosyalar,
            COALESCE(gelir_tutari,0) AS "gelirTutari", COALESCE(gider_tutari,0) AS "giderTutari",
            finansal_aciklama AS "finansalAciklama"
     FROM ziyaretler ORDER BY id DESC`
  );
  return rows;
}

async function createVisit(payload) {
  const pool = getPool();
  
  // dosyalar alanını düzgün formatla
  let dosyalar = null;
  if (payload.dosyalar) {
    try {
      // Eğer string ise JSON parse et
      if (typeof payload.dosyalar === 'string') {
        dosyalar = JSON.parse(payload.dosyalar);
      } else {
        dosyalar = payload.dosyalar;
      }
      
      // Array değilse array'e çevir
      if (!Array.isArray(dosyalar)) {
        dosyalar = [dosyalar];
      }
    } catch (error) {
      console.error('Dosyalar JSON parse hatası:', error);
      dosyalar = null;
    }
  }
  
  const { rows } = await pool.query(
    `INSERT INTO ziyaretler (tarih, saat, firma, ziyaretci, amac, durum, notlar, detayli_bilgi, katilimcilar, lokasyon, dosyalar, gelir_tutari, gider_tutari, finansal_aciklama)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id, to_char(tarih,'YYYY-MM-DD') as tarih, saat, firma, ziyaretci, amac, durum,
               notlar, detayli_bilgi AS "detayliBilgi", katilimcilar, lokasyon, dosyalar,
               COALESCE(gelir_tutari,0) AS "gelirTutari", COALESCE(gider_tutari,0) AS "giderTutari",
               finansal_aciklama AS "finansalAciklama"`,
    [payload.tarih, payload.saat, payload.firma, payload.ziyaretci, payload.amac, payload.durum, payload.notlar || null, payload.detayliBilgi || null, payload.katilimcilar || null, payload.lokasyon || null, dosyalar, payload.gelirTutari || null, payload.giderTutari || null, payload.finansalAciklama || null]
  );
  return rows[0];
}

async function findVisitById(id) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, to_char(tarih,'YYYY-MM-DD') as tarih, saat, firma, ziyaretci, amac, durum,
            notlar, detayli_bilgi AS "detayliBilgi", katilimcilar, lokasyon, dosyalar,
            COALESCE(gelir_tutari,0) AS "gelirTutari", COALESCE(gider_tutari,0) AS "giderTutari",
            finansal_aciklama AS "finansalAciklama"
     FROM ziyaretler WHERE id=$1`,
    [id]
  );
  return rows[0] || null;
}

async function updateVisit(id, fields) {
  const pool = getPool();
  
  // dosyalar alanını düzgün formatla
  if (fields.dosyalar) {
    try {
      // Eğer string ise JSON parse et
      if (typeof fields.dosyalar === 'string') {
        fields.dosyalar = JSON.parse(fields.dosyalar);
      }
      
      // Array değilse array'e çevir
      if (!Array.isArray(fields.dosyalar)) {
        fields.dosyalar = [fields.dosyalar];
      }
    } catch (error) {
      console.error('Dosyalar JSON parse hatası:', error);
      fields.dosyalar = null;
    }
  }
  
  const map = {
    tarih: 'tarih',
    saat: 'saat',
    firma: 'firma',
    ziyaretci: 'ziyaretci',
    amac: 'amac',
    durum: 'durum',
    notlar: 'notlar',
    detayliBilgi: 'detayli_bilgi',
    katilimcilar: 'katilimcilar',
    lokasyon: 'lokasyon',
    dosyalar: 'dosyalar',
    gelirTutari: 'gelir_tutari',
    giderTutari: 'gider_tutari',
    finansalAciklama: 'finansal_aciklama',
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
  if (!set.length) return findVisitById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE ziyaretler SET ${set.join(',')} WHERE id=$${idx}
     RETURNING id, to_char(tarih,'YYYY-MM-DD') as tarih, saat, firma, ziyaretci, amac, durum,
               notlar, detayli_bilgi AS "detayliBilgi", katilimcilar, lokasyon, dosyalar,
               COALESCE(gelir_tutari,0) AS "gelirTutari", COALESCE(gider_tutari,0) AS "giderTutari",
               finansal_aciklama AS "finansalAciklama"`,
    values
  );
  return rows[0] || null;
}

async function deleteVisit(id) {
  const pool = getPool();
  await pool.query('DELETE FROM ziyaretler WHERE id=$1', [id]);
}

module.exports = { listVisits, createVisit, findVisitById, updateVisit, deleteVisit };


