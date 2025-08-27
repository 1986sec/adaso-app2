const { getPool } = require('../db');

async function search(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const results = [];
    const pool = getPool();
    if (!q) return res.json(results);

    // Firmalar
    const { rows: firms } = await pool.query(
      `SELECT firma_adi AS name, sektor AS detail FROM firmalar WHERE firma_adi ILIKE $1 OR sektor ILIKE $1 LIMIT 10`,
      [`%${q}%`]
    );
    for (const f of firms) {
      results.push({ date: '', name: f.name, detail: f.detail, status: 'firma', type: 'Firma' });
    }

    // Ziyaretler
    const { rows: visits } = await pool.query(
      `SELECT to_char(tarih,'YYYY-MM-DD') as date, firma AS name, amac AS detail, durum FROM ziyaretler
       WHERE firma ILIKE $1 OR amac ILIKE $1 LIMIT 10`,
      [`%${q}%`]
    );
    for (const v of visits) {
      const statusMap = { 'Planlandı': 'planlandı', 'Tamamlandı': 'görüşme-yapılan', 'İptal Edildi': 'ziyaret-edilmedi' };
      results.push({ date: v.date, name: v.name, detail: v.detail, status: statusMap[v.durum] || 'planlandı', type: 'Ziyaret' });
    }

    // Gelir/Gider
    const { rows: incExp } = await pool.query(
      `SELECT to_char(tarih,'YYYY-MM-DD') as date, aciklama AS name, tutar, tur FROM gelir_gider
       WHERE aciklama ILIKE $1 LIMIT 10`,
      [`%${q}%`]
    );
    for (const r of incExp) {
      results.push({ date: r.date, name: r.name, detail: `${r.tutar} ₺`, status: r.tur.toLowerCase(), type: r.tur });
    }

    return res.json(results);
  } catch (e) { return next(e); }
}

async function suggestions(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const pool = getPool();
    const out = new Set();
    if (!q) return res.json([]);

    const queries = [
      `SELECT firma_adi FROM firmalar WHERE firma_adi ILIKE $1 LIMIT 5`,
      `SELECT sektor FROM firmalar WHERE sektor ILIKE $1 LIMIT 5`,
      `SELECT yetkili_kisi FROM firmalar WHERE yetkili_kisi ILIKE $1 LIMIT 5`,
      `SELECT ziyaretci FROM ziyaretler WHERE ziyaretci ILIKE $1 LIMIT 5`,
      `SELECT amac FROM ziyaretler WHERE amac ILIKE $1 LIMIT 5`,
      `SELECT aciklama FROM gelir_gider WHERE aciklama ILIKE $1 LIMIT 5`,
    ];
    for (const sql of queries) {
      const { rows } = await pool.query(sql, [`%${q}%`]);
      for (const r of rows) {
        const val = Object.values(r)[0];
        if (val) out.add(val);
      }
    }
    return res.json(Array.from(out));
  } catch (e) { return next(e); }
}

module.exports = { search, suggestions };


