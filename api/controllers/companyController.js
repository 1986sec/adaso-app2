const companies = require('../repositories/companyRepo');

async function list(req, res, next) {
  try {
    const data = await companies.listCompanies();
    return res.json(data);
  } catch (e) { return next(e); }
}

async function create(req, res, next) {
  try {
    const { firmaAdi, sektor, telefon } = req.body || {};
    if (!firmaAdi || !sektor || !telefon) {
      return res.status(400).json({ error: true, message: 'Zorunlu alanlar eksik', code: 'VALIDATION_ERROR' });
    }
    // Not: frontend sözleşmesi gereği benzersizlik hatalarını burada değil DB unique ile yönetmek de mümkün
    const created = await companies.createCompany(req.body);
    return res.json(created);
  } catch (e) { return next(e); }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const updated = await companies.updateCompany(id, req.body || {});
    if (!updated) return res.status(404).json({ error: true, message: 'Firma bulunamadı', code: 'NOT_FOUND' });
    return res.json(updated);
  } catch (e) { return next(e); }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;
    await companies.deleteCompany(id);
    return res.json({ ok: true });
  } catch (e) { return next(e); }
}

module.exports = { list, create, update, remove };


