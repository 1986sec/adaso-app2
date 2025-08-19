const multer = require('multer');
const path = require('path');
const config = require('../../config.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya türü'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: fileFilter
});

module.exports = upload;