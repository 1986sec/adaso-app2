const { getPool } = require('./db');

async function initSchema() {
  const pool = getPool();
  await pool.query('BEGIN');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Kullanici" (
        id SERIAL PRIMARY KEY,
        adsoyad TEXT,
        email TEXT UNIQUE NOT NULL,
        kullaniciAdi TEXT UNIQUE NOT NULL,
        sifre TEXT NOT NULL,
        telefon TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Firma" (
        id SERIAL PRIMARY KEY,
        firmaAdi TEXT NOT NULL,
        sektor TEXT NOT NULL,
        telefon TEXT NOT NULL,
        email TEXT,
        yetkiliKisi TEXT,
        yetkiliNumara TEXT,
        adres TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_firma_adi ON "Firma"(firmaAdi);
      CREATE INDEX IF NOT EXISTS idx_firma_sektor ON "Firma"(sektor);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Ziyaret" (
        id SERIAL PRIMARY KEY,
        tarih DATE NOT NULL,
        saat TEXT NOT NULL,
        firma TEXT NOT NULL,
        ziyaretci TEXT NOT NULL,
        amac TEXT NOT NULL,
        durum TEXT NOT NULL CHECK (durum IN ('Planlandı','Tamamlandı','İptal Edildi')),
        notlar TEXT,
        detayliBilgi TEXT,
        katilimcilar TEXT,
        lokasyon TEXT,
        dosyalar TEXT[],
        gelirTutari NUMERIC,
        giderTutari NUMERIC,
        finansalAciklama TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_ziyaret_tarih ON "Ziyaret"(tarih);
      CREATE INDEX IF NOT EXISTS idx_ziyaret_durum ON "Ziyaret"(durum);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "GelirGider" (
        id SERIAL PRIMARY KEY,
        tarih DATE NOT NULL,
        aciklama TEXT NOT NULL,
        kategori TEXT NOT NULL,
        tur TEXT NOT NULL CHECK (tur IN ('Gelir','Gider')),
        tutar NUMERIC NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_gelirgider_tarih ON "GelirGider"(tarih);
      CREATE INDEX IF NOT EXISTS idx_gelirgider_tur ON "GelirGider"(tur);
    `);

    await pool.query('COMMIT');
  } catch (e) {
    await pool.query('ROLLBACK');
    throw e;
  }
}

module.exports = { initSchema };


