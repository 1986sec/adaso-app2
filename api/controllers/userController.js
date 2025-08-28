const users = require('../repositories/userRepo');

async function profile(req, res, next) {
  try {
    console.log('Profile request - User ID:', req.user.id);
    console.log('Profile request - User object:', req.user);
    
    const u = await users.findById(req.user.id);
    if (!u) {
      console.log('User not found in database for ID:', req.user.id);
      return res.status(404).json({ error: true, message: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });
    }
    
    console.log('User found:', { id: u.id, adsoyad: u.adsoyad, email: u.email, kullaniciAdi: u.kullanici_adi });
    return res.json({ id: u.id, adsoyad: u.adsoyad, email: u.email, kullaniciAdi: u.kullanici_adi, telefon: u.telefon });
  } catch (e) { 
    console.error('Profile error:', e);
    return next(e); 
  }
}

async function updateProfile(req, res, next) {
  try {
    const fields = {};
    if (req.body.adsoyad !== undefined) fields.adsoyad = req.body.adsoyad;
    if (req.body.email !== undefined) fields.email = req.body.email;
    if (req.body.kullaniciAdi !== undefined) fields.kullanici_adi = req.body.kullaniciAdi;
    if (req.body.telefon !== undefined) fields.telefon = req.body.telefon;
    try {
      const updated = await users.updateUser(req.user.id, fields);
      return res.json({ id: updated.id, adsoyad: updated.adsoyad, email: updated.email, kullaniciAdi: updated.kullanici_adi, telefon: updated.telefon });
    } catch (e) {
      // Unique ihlali durumunda 409 döndür
      if (e && e.code === '23505') {
        return res.status(409).json({ error: true, message: 'Kullanıcı adı veya email kullanılıyor', code: 'DUPLICATE' });
      }
      throw e;
    }
  } catch (e) { return next(e); }
}

module.exports = { profile, updateProfile };


