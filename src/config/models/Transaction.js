const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'İşlem türü gerekli']
  },
  category: {
    type: String,
    required: [true, 'Kategori gerekli'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Tutar gerekli'],
    min: [0, 'Tutar pozitif olmalı']
  },
  description: {
    type: String,
    required: [true, 'Açıklama gerekli'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'İşlem tarihi gerekli'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'check'],
    default: 'cash'
  },
  reference: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);