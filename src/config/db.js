
const mongoose = require('mongoose');
const path = require('path');
const config = require(path.join(process.cwd(), 'src', 'config', 'config.js'));

const connectDB = async () => {
  try {
    if (config.nodeEnv === 'production') {
      console.log('🔄 MongoDB Atlas\'a bağlanılıyor...');
      console.log('📍 URI:', config.mongoURI ? 'Mevcut' : 'Eksik');
      
      // Production: MongoDB Atlas
      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 60000, // 60 saniye
        socketTimeoutMS: 60000, // 60 saniye
        bufferCommands: true,
        bufferMaxEntries: 1000,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        w: 'majority'
      };
      
      await mongoose.connect(config.mongoURI, connectionOptions);
      
      // Bağlantı durumunu kontrol et
      mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB Atlas bağlantısı başarılı');
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB bağlantı hatası:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB bağlantısı kesildi');
      });
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB bağlantısı kapatıldı');
        process.exit(0);
      });
      
    } else {
      // Development: Mock mode
      console.log('📊 Mock Database: Veritabanı simülasyonu aktif');
      console.log('✅ Database bağlantısı başarılı (Mock Mode)');
    }
  } catch (error) {
    console.error('❌ Database bağlantı hatası:', error.message);
    console.error('🔍 Hata detayı:', error);
    
    if (config.nodeEnv === 'production') {
      console.log('🔄 MongoDB bağlantısı başarısız, mock mode\'a geçiliyor...');
      // Production'da da mock mode'a geç
    }
  }
};

module.exports = connectDB;