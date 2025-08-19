const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require(path.join(process.cwd(), 'src', 'config', 'models', 'User.js'));
const PasswordReset = require(path.join(process.cwd(), 'src', 'config', 'models', 'PasswordReset.js'));
const { authenticateToken } = require(path.join(process.cwd(), 'src', 'config', 'models', 'routes', 'middleware', 'auth.js'));
const { sendPasswordResetEmail } = require(path.join(process.cwd(), 'src', 'utils', 'emailService.js'));
const config = require(path.join(process.cwd(), 'src', 'config', 'config.js'));
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Register request body:', req.body); // Debug için
    
    // Frontend'den gelen field'ları map et
    const { adsoyad, email, kullaniciAdi, sifre, phone } = req.body;
    
    // Field mapping
    const username = kullaniciAdi;
    const password = sifre;
    const fullName = adsoyad;
    
    // Validation kontrolü
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Eksik alanlar',
        required: ['kullaniciAdi', 'email', 'sifre'],
        received: { 
          kullaniciAdi: !!kullaniciAdi, 
          email: !!email, 
          sifre: !!sifre 
        }
      });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Kullanıcı zaten mevcut' });
    }

    const user = new User({ username, email, password, fullName: fullName || '', phone: phone || '' });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );

    res.status(201).json({
      message: 'Kayıt başarılı',
      token,
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login request body:', req.body); // Debug için
    
    // Frontend'den gelen field'ları map et
    const { kullaniciAdi, sifre } = req.body;
    const username = kullaniciAdi;
    const password = sifre;
    
    console.log('🔍 Aranan username:', username);
    console.log('🔍 Aranan password:', password);
    
    // Case-insensitive username search
    const user = await User.findOne({ 
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }, // Case-insensitive username
        { email: { $regex: new RegExp(`^${username}$`, 'i') } }     // Case-insensitive email
      ],
      isActive: true 
    });
    
    console.log('🔍 Bulunan user:', user ? 'Var' : 'Yok');
    if (user) {
      console.log('🔍 User ID:', user._id);
      console.log('🔍 User username:', user.username);
      console.log('🔍 User email:', user.email);
      console.log('🔍 User password hash:', user.password);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Şifre debug'ı
    console.log('🔍 Frontend\'den gelen şifre:', password);
    console.log('🔍 Database\'deki hash:', user.password);
    
    // Manuel şifre karşılaştırması
    const bcrypt = require('bcrypt');
    const manualCompare = await bcrypt.compare(password, user.password);
    console.log('🔍 Manuel bcrypt karşılaştırması:', manualCompare);
    
    const passwordMatch = await user.comparePassword(password);
    console.log('🔍 User.comparePassword sonucu:', passwordMatch);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        message: 'Şifre hatalı',
        debug: {
          frontendPassword: password,
          dbHash: user.password,
          manualCompare: manualCompare,
          userCompare: passwordMatch
        }
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const token = PasswordReset.generateToken();
    const passwordReset = new PasswordReset({ userId: user._id, token });
    await passwordReset.save();

    await sendPasswordResetEmail(email, token);
    res.json({ message: 'Şifre sıfırlama linki gönderildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const passwordReset = await PasswordReset.findOne({ token, isUsed: false });
    if (!passwordReset || !passwordReset.isValid()) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }

    const user = await User.findById(passwordReset.userId);
    user.password = newPassword;
    await user.save();

    passwordReset.isUsed = true;
    await passwordReset.save();

    res.json({ message: 'Şifre başarıyla sıfırlandı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, phone },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Profil güncellendi', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;