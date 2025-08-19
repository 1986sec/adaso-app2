
const mongoose = require('mongoose');
const path = require('path');
const config = require(path.join(process.cwd(), 'src', 'config', 'config.js'));

let isConnected = false;

const connectDB = async () => {
  try {
    console.log('🔄 MongoDB Atlas\'a bağlanılıyor...');
    console.log('📍 URI:', config.mongoURI ? 'Mevcut' : 'Eksik');
    console.log('🌍 Environment:', config.nodeEnv);
    
    // MongoDB bağlantısı
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000, // 60 saniye
      socketTimeoutMS: 60000, // 60 saniye
      bufferCommands: false, // Buffer'ı kapat
      maxPoolSize: 1, // Tek bağlantı
      minPoolSize: 1,
      maxIdleTimeMS: 30000
    });
    
    // Bağlantı durumunu kontrol et
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Atlas bağlantısı başarılı');
      isConnected = true;
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB bağlantı hatası:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB bağlantısı kesildi');
      isConnected = false;
    });
    
    // Bağlantının hazır olmasını bekle
    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
        
        // 30 saniye timeout
        setTimeout(() => reject(new Error('Connection timeout')), 30000);
      }
    });
    
    console.log('✅ MongoDB bağlantısı tamamen hazır!');
    
  } catch (error) {
    console.error('❌ Database bağlantı hatası:', error.message);
    console.error('🔍 Hata detayı:', error);
    
    // Hata durumunda process'i sonlandır
    console.log('💥 Kritik hata: MongoDB bağlantısı kurulamadı');
    process.exit(1);
  }
};

// Bağlantı durumunu kontrol et
const checkConnection = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = { connectDB, checkConnection };

module.exports = connectDB;