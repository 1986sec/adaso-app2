const { Pool } = require('pg');

let pool;
let connected = false;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is required');
    
    // Force SSL bypass for Supabase self-signed certificates
    const sslConfig = {
      rejectUnauthorized: false,
      sslmode: 'require'
    };
    
    pool = new Pool({
      connectionString,
      ssl: sslConfig,
      connectionTimeoutMillis: 10000, // Increased timeout
      keepAlive: true,
      max: 20, // Connection pool size
      idleTimeoutMillis: 30000,
    });
    
    // Test connection immediately
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      connected = false;
    });
  }
  return pool;
}

async function initDb() {
  console.log('🔌 Veritabanı bağlantısı başlatılıyor...');
  const client = await getPool().connect();
  try {
    console.log('✅ Veritabanı bağlantısı başarılı!');
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        adsoyad TEXT,
        email TEXT UNIQUE NOT NULL,
        kullanici_adi TEXT UNIQUE NOT NULL,
        sifre TEXT NOT NULL,
        telefon TEXT,
        reset_token TEXT,
        reset_token_created_at TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS firmalar (
        id SERIAL PRIMARY KEY,
        firma_adi TEXT NOT NULL,
        sektor TEXT NOT NULL,
        telefon TEXT NOT NULL,
        email TEXT,
        yetkili_kisi TEXT,
        yetkili_numara TEXT,
        adres TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_firma_adi ON firmalar(firma_adi);
      CREATE INDEX IF NOT EXISTS idx_firma_sektor ON firmalar(sektor);
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ziyaretler (
        id SERIAL PRIMARY KEY,
        tarih DATE NOT NULL,
        saat TEXT NOT NULL,
        firma TEXT NOT NULL,
        ziyaretci TEXT NOT NULL,
        amac TEXT NOT NULL,
        durum TEXT NOT NULL CHECK (durum IN ('Planlandı','Tamamlandı','İptal Edildi')),
        notlar TEXT,
        detayli_bilgi TEXT,
        katilimcilar TEXT,
        lokasyon TEXT,
        dosyalar JSONB DEFAULT '[]'::jsonb,
        gelir_tutari NUMERIC,
        gider_tutari NUMERIC,
        finansal_aciklama TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_ziyaret_tarih ON ziyaretler(tarih);
      CREATE INDEX IF NOT EXISTS idx_ziyaret_firma ON ziyaretler(firma);
      CREATE INDEX IF NOT EXISTS idx_ziyaret_durum ON ziyaretler(durum);
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS gelir_gider (
        id SERIAL PRIMARY KEY,
        tarih DATE NOT NULL,
        aciklama TEXT NOT NULL,
        kategori TEXT NOT NULL,
        tur TEXT NOT NULL CHECK (tur IN ('Gelir','Gider')),
        tutar NUMERIC NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_gelirgider_tarih ON gelir_gider(tarih);
      CREATE INDEX IF NOT EXISTS idx_gelirgider_tur ON gelir_gider(tur);
      CREATE INDEX IF NOT EXISTS idx_gelirgider_kategori ON gelir_gider(kategori);
    `);
    await client.query('COMMIT');
    connected = true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

function checkConnection() {
  return connected;
}

module.exports = { getPool, initDb, checkConnection };


