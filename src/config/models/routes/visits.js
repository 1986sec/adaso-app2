const express = require('express');
const path = require('path');
const Visit = require(path.join(process.cwd(), 'src', 'config', 'models', 'Visit.js'));
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const upload = require('./middleware/upload');
const router = express.Router();

// Get all visits
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, company, startDate, endDate } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (company) query.company = company;
    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate);
      if (endDate) query.visitDate.$lte = new Date(endDate);
    }

    const visits = await Visit.find(query)
      .populate('company', 'companyName contactPerson')
      .populate('createdBy', 'fullName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ visitDate: -1 });

    const total = await Visit.countDocuments(query);

    res.json({
      visits,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create visit
router.post('/', authenticateToken, async (req, res) => {
  try {
    const visit = new Visit({
      ...req.body,
      createdBy: req.user.userId
    });
    await visit.save();
    await visit.populate('company', 'companyName');
    res.status(201).json({ message: 'Ziyaret eklendi', visit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get visit by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('company')
      .populate('createdBy', 'fullName');
    if (!visit) {
      return res.status(404).json({ message: 'Ziyaret bulunamadı' });
    }
    res.json({ visit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update visit
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'companyName');
    if (!visit) {
      return res.status(404).json({ message: 'Ziyaret bulunamadı' });
    }
    res.json({ message: 'Ziyaret güncellendi', visit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete visit
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { outcome, followUpRequired, nextVisitDate } = req.body;
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed',
        outcome,
        followUpRequired,
        nextVisitDate
      },
      { new: true }
    ).populate('company', 'companyName');
    
    if (!visit) {
      return res.status(404).json({ message: 'Ziyaret bulunamadı' });
    }
    res.json({ message: 'Ziyaret tamamlandı', visit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload visit files
router.post('/:id/upload', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Ziyaret bulunamadı' });
    }

    const attachments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    }));

    visit.attachments.push(...attachments);
    await visit.save();

    res.json({ message: 'Dosyalar yüklendi', attachments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete visit (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Ziyaret bulunamadı' });
    }
    res.json({ message: 'Ziyaret silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;