const express = require('express');
const { authenticateToken } = require('./middleware/auth');
const upload = require('./middleware/upload');
const router = express.Router();

// Upload single file
router.post('/single', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya seçilmedi' });
    }

    res.json({
      message: 'Dosya başarıyla yüklendi',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple files
router.post('/multiple', authenticateToken, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Dosya seçilmedi' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: file.path
    }));

    res.json({
      message: `${files.length} dosya başarıyla yüklendi`,
      files
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;