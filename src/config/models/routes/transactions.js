const express = require('express');
const path = require('path');
const Transaction = require(path.join(process.cwd(), 'src', 'config', 'models', 'Transaction.js'));
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const upload = require('./middleware/upload');
const router = express.Router();

// Get all transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('createdBy', 'fullName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      createdBy: req.user.userId
    });
    await transaction.save();
    res.status(201).json({ message: 'İşlem eklendi', transaction });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('createdBy', 'fullName');
    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update transaction
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }
    res.json({ message: 'İşlem güncellendi', transaction });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload transaction files
router.post('/:id/upload', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }

    const attachments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    }));

    transaction.attachments.push(...attachments);
    await transaction.save();

    res.json({ message: 'Dosyalar yüklendi', attachments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get financial stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalIncome = await Transaction.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalExpense = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const categoryStats = await Transaction.aggregate([
      { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0,
      balance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete transaction (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }
    res.json({ message: 'İşlem silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;