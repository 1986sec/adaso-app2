const visits = require('../repositories/visitRepo');

async function list(req, res, next) {
  try {
    const data = await visits.listVisits();
    return res.json(data);
  } catch (e) { return next(e); }
}

async function create(req, res, next) {
  try {
    const required = ['tarih','saat','firma','ziyaretci','amac','durum'];
    for (const k of required) { if (!req.body || !req.body[k]) return res.status(400).json({ error: true, message: 'Zorunlu alanlar eksik', code: 'VALIDATION_ERROR' }); }
    if (!/^\d{2}:\d{2}$/.test(req.body.saat)) {
      return res.status(400).json({ error: true, message: 'Saat formatı HH:mm olmalı', code: 'INVALID_TIME' });
    }
    if (!['Planlandı','Tamamlandı','İptal Edildi'].includes(req.body.durum)) {
      return res.status(400).json({ error: true, message: 'durum değeri geçersiz', code: 'VALIDATION_ERROR' });
    }
    
    // dosyalar alanını validate et
    if (req.body.dosyalar) {
      try {
        let dosyalar = req.body.dosyalar;
        if (typeof dosyalar === 'string') {
          dosyalar = JSON.parse(dosyalar);
        }
        if (!Array.isArray(dosyalar)) {
          return res.status(400).json({ error: true, message: 'Dosyalar alanı array olmalı', code: 'VALIDATION_ERROR' });
        }
      } catch (error) {
        return res.status(400).json({ error: true, message: 'Dosyalar alanı geçersiz JSON formatı', code: 'VALIDATION_ERROR' });
      }
    }
    
    const created = await visits.createVisit(req.body);
    return res.json(created);
  } catch (e) { return next(e); }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    if (req.body && req.body.saat !== undefined && !/^\d{2}:\d{2}$/.test(req.body.saat)) {
      return res.status(400).json({ error: true, message: 'Saat formatı HH:mm olmalı', code: 'INVALID_TIME' });
    }
    if (req.body && req.body.durum !== undefined && !['Planlandı','Tamamlandı','İptal Edildi'].includes(req.body.durum)) {
      return res.status(400).json({ error: true, message: 'durum değeri geçersiz', code: 'VALIDATION_ERROR' });
    }
    
    // dosyalar alanını validate et
    if (req.body && req.body.dosyalar) {
      try {
        let dosyalar = req.body.dosyalar;
        if (typeof dosyalar === 'string') {
          dosyalar = JSON.parse(dosyalar);
        }
        if (!Array.isArray(dosyalar)) {
          return res.status(400).json({ error: true, message: 'Dosyalar alanı array olmalı', code: 'VALIDATION_ERROR' });
        }
      } catch (error) {
        return res.status(400).json({ error: true, message: 'Dosyalar alanı geçersiz JSON formatı', code: 'VALIDATION_ERROR' });
      }
    }
    
    const updated = await visits.updateVisit(id, req.body || {});
    if (!updated) return res.status(404).json({ error: true, message: 'Ziyaret bulunamadı', code: 'NOT_FOUND' });
    return res.json(updated);
  } catch (e) { return next(e); }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;
    await visits.deleteVisit(id);
    return res.json({ ok: true });
  } catch (e) { return next(e); }
}

module.exports = { list, create, update, remove };


