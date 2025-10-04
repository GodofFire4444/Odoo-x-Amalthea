const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sequential', 'percentage', 'specific_approver', 'hybrid'],
    default: 'sequential'
  },
  approvers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sequence: Number
  }],
  percentageRequired: {
    type: Number,
    min: 1,
    max: 100
  },
  specificApprovers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  amountThreshold: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);