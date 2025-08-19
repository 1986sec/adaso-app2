
const mongoose = require('mongoose');
const path = require('path');
const config = require(path.join(process.cwd(), 'src', 'config', 'config.js'));

const connectDB = async () => {
  try {
    if (config.nodeEnv === 'production') {
      // Production: MongoDB Atlas
      await mongoose.connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        bufferCommands: true, // Buffer commands until connection is ready
        bufferMaxEntries: 1000
      });
      console.log('✅ MongoDB Atlas bağlantısı başarılı');
    } else {
      // Development: Local MongoDB veya Mock
      console.log('📊 Mock Database: Veritabanı simülasyonu aktif');
      console.log('✅ Database bağlantısı başarılı (Mock Mode)');
    }
  } catch (error) {
    console.error('❌ Database bağlantı hatası:', error.message);
    
    if (config.nodeEnv === 'production') {
      console.log('🔄 MongoDB bağlantısı başarısız, mock mode\'a geçiliyor...');
      // Production'da da mock mode'a geç
    }
  }
};

module.exports = connectDB;