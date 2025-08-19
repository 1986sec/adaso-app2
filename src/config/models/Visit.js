const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Firma gerekli']
  },
  visitDate: {
    type: Date,
    required: [true, 'Ziyaret tarihi gerekli']
  },
  status: {
    type: String,
    enum: ['planned', 'completed', 'cancelled'],
    default: 'planned'
  },
  notes: {
    type: String,
    trim: true
  },
  nextVisitDate: {
    type: Date
  },
  visitType: {
    type: String,
    enum: ['regular', 'special'],
    default: 'regular'
  },
  outcome: {
    type: String,
    trim: true
  },
  followUpRequired: {
    type: Boolean,
    default: false
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

visitSchema.index({ company: 1, visitDate: -1 });
visitSchema.index({ status: 1 });
visitSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Visit', visitSchema);