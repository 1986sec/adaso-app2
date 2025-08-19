const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3600000) // 1 hour
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  }
}, {
  timestamps: true
});

passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ userId: 1 });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

passwordResetSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

passwordResetSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

passwordResetSchema.methods.isValid = function() {
  return !this.isUsed && !this.isExpired() && this.attempts < 5;
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema);