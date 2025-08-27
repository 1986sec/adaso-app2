
const { Pool } = require('pg');
const path = require('path');
const config = require(path.join(process.cwd(), 'src', 'config', 'config.js'));

let pool;
let isConnected = false;

const connectDB = async () => {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL env missing');

    pool = new Pool({
      connectionString,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
    });

    // Simple test query
    await pool.query('SELECT 1');
    isConnected = true;
    console.log('✅ Postgres (Supabase) bağlantısı başarılı');
  } catch (error) {
    isConnected = false;
    console.error('❌ Postgres bağlantı hatası:', error);
    process.exit(1);
  }
};

const checkConnection = () => isConnected;

const getPool = () => {
  if (!pool) throw new Error('DB not initialized');
  return pool;
};

module.exports = { connectDB, checkConnection, getPool };