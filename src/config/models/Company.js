const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Firma adı gerekli'],
    unique: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Yetkili kişi gerekli'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email gerekli'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli email adresi girin']
  },
  phone: {
    type: String,
    required: [true, 'Telefon gerekli'],
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  sector: {
    type: String,
    required: [true, 'Sektör gerekli'],
    enum: ['Teknoloji', 'Sağlık', 'Eğitim', 'Finans', 'İmalat', 'Hizmet', 'Diğer']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect'],
    default: 'prospect'
  },
  notes: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  taxNumber: {
    type: String,
    trim: true
  },
  employeeCount: {
    type: Number,
    min: 0
  },
  annualRevenue: {
    type: Number,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

companySchema.index({ companyName: 'text', contactPerson: 'text' });

module.exports = mongoose.model('Company', companySchema);