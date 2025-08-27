const repo = require('../repositories/incomeExpenseRepo');

async function list(req, res, next) {
  try {
    const data = await repo.listAll();
    return res.json(data);
  } catch (e) { return next(e); }
}

async function create(req, res, next) {
  try {
    const { tarih, aciklama, kategori, tur, tutar } = req.body || {};
    if (!tarih || !aciklama || !kategori || !tur || tutar === undefined) {
      return res.status(400).json({ error: true, message: 'Zorunlu alanlar eksik', code: 'VALIDATION_ERROR' });
    }
    if (!['Gelir','Gider'].includes(tur)) {
      return res.status(400).json({ error: true, message: 'tur değeri geçersiz', code: 'VALIDATION_ERROR' });
    }
    const created = await repo.createOne(req.body);
    return res.json(created);
  } catch (e) { return next(e); }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    if (req.body && req.body.tur !== undefined && !['Gelir','Gider'].includes(req.body.tur)) {
      return res.status(400).json({ error: true, message: 'tur değeri geçersiz', code: 'VALIDATION_ERROR' });
    }
    const updated = await repo.updateOne(id, req.body || {});
    if (!updated) return res.status(404).json({ error: true, message: 'Kayıt bulunamadı', code: 'NOT_FOUND' });
    return res.json(updated);
  } catch (e) { return next(e); }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;
    await repo.deleteOne(id);
    return res.json({ ok: true });
  } catch (e) { return next(e); }
}

module.exports = { list, create, update, remove };


