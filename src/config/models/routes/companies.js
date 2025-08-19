const express = require('express');
const path = require('path');
const Company = require(path.join(process.cwd(), 'src', 'config', 'models', 'Company.js'));
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const router = express.Router();

// Get all companies
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, sector, status, search } = req.query;
    const query = {};
    
    if (sector) query.sector = sector;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }

    const companies = await Company.find(query)
      .populate('createdBy', 'fullName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Company.countDocuments(query);

    res.json({
      companies,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create company
router.post('/', authenticateToken, async (req, res) => {
  try {
    const company = new Company({
      ...req.body,
      createdBy: req.user.userId
    });
    await company.save();
    res.status(201).json({ message: 'Firma eklendi', company });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get company by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('createdBy', 'fullName');
    if (!company) {
      return res.status(404).json({ message: 'Firma bulunamadı' });
    }
    res.json({ company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update company
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!company) {
      return res.status(404).json({ message: 'Firma bulunamadı' });
    }
    res.json({ message: 'Firma güncellendi', company });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete company (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Firma bulunamadı' });
    }
    res.json({ message: 'Firma silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get company stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ status: 'active' });
    const prospectCompanies = await Company.countDocuments({ status: 'prospect' });
    
    const sectorStats = await Company.aggregate([
      { $group: { _id: '$sector', count: { $sum: 1 } } }
    ]);

    res.json({
      totalCompanies,
      activeCompanies,
      prospectCompanies,
      sectorStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;