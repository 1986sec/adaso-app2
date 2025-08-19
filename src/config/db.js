
const mongoose = require('mongoose');
const path = require('path');
const config = require(path.join(process.cwd(), 'src', 'config', 'config.js'));

const connectDB = async () => {
  try {
    console.log('🔄 MongoDB Atlas\'a bağlanılıyor...');
    console.log('📍 URI:', config.mongoURI ? 'Mevcut' : 'Eksik');
    console.log('🌍 Environment:', config.nodeEnv);
    
    // Basit MongoDB bağlantısı
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      bufferCommands: true,
      bufferMaxEntries: 1000
    };
    
    await mongoose.connect(config.mongoURI, connectionOptions);
    console.log('✅ MongoDB Atlas bağlantısı başarılı');
    
    // Bağlantı durumunu kontrol et
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB bağlantısı aktif');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB bağlantı hatası:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB bağlantısı kesildi');
    });
    
  } catch (error) {
    console.error('❌ Database bağlantı hatası:', error.message);
    console.error('🔍 Hata detayı:', error);
    
    // Hata durumunda process'i sonlandır
    console.log('💥 Kritik hata: MongoDB bağlantısı kurulamadı');
    process.exit(1);
  }
};

module.exports = connectDB;