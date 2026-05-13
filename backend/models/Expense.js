const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  approvalRule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalRule',
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  convertedAmount: {
    type: Number
  },
  category: {
    type: String,
    required: true,
    enum: ['Travel', 'Meals', 'Office Supplies', 'Entertainment', 'Accommodation', 'Transportation', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  merchant: {
    type: String
  },
  receipt: {
    type: String // Base64 or URL
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'partially_approved'],
    default: 'pending'
  },
  currentApproverStep: {
    type: Number,
    default: 0
  },
  approvalHistory: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    step: {
      type: Number,
      default: 0
    },
    stage: {
      type: String,
      default: 'workflow'
    },
    action: {
      type: String,
      enum: ['approved', 'rejected']
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

module.exports = mongoose.model('Expense', expenseSchema);