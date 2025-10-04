const Expense = require('../models/Expense');
const User = require('../models/User');
const Company = require('../models/Company');
const { convertCurrency } = require('../utils/currencyConverter');
const { parseReceiptText } = require('../utils/ocrService');

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { amount, currency, category, description, date, merchant, receipt } = req.body;

    // Validate input
    if (!amount || !currency || !category || !description || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Get company currency
    const company = await Company.findById(req.companyId);
    
    // Convert amount to company currency
    let convertedAmount = amount;
    if (currency !== company.currency) {
      convertedAmount = await convertCurrency(amount, currency, company.currency);
    }

    // Create expense
    const expense = new Expense({
      employee: req.userId,
      company: req.companyId,
      amount,
      currency,
      convertedAmount,
      category,
      description,
      date,
      merchant,
      receipt
    });

    await expense.save();
    await expense.populate('employee', 'username email');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense }
    });

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
};

// Get all expenses (with filters)
exports.getExpenses = async (req, res) => {
  try {
    const { status, category, startDate, endDate } = req.query;
    
    let query = { company: req.companyId };

    // Role-based filtering
    if (req.user.role === 'employee') {
      query.employee = req.userId;
    }

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('employee', 'username email')
      .populate('approvalHistory.approver', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { expenses }
    });

  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};

// Get single expense
exports.getExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findOne({
      _id: expenseId,
      company: req.companyId
    })
      .populate('employee', 'username email role')
      .populate('approvalHistory.approver', 'username email role');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check access rights
    if (req.user.role === 'employee' && expense.employee._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { expense }
    });

  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

// Get pending approvals for manager
exports.getPendingApprovals = async (req, res) => {
  try {
    let query = {
      company: req.companyId,
      status: 'pending'
    };

    // For managers, get expenses where they are the manager of the employee
    if (req.user.role === 'manager') {
      const subordinates = await User.find({
        company: req.companyId,
        manager: req.userId
      }).select('_id');

      const subordinateIds = subordinates.map(s => s._id);
      query.employee = { $in: subordinateIds };
    }

    const expenses = await Expense.find(query)
      .populate('employee', 'username email manager')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { expenses }
    });

  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending approvals',
      error: error.message
    });
  }
};

// Parse OCR text
exports.parseOCR = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide OCR text'
      });
    }

    const parsedData = parseReceiptText(text);

    res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Parse OCR error:', error);
    res.status(500).json({
      success: false,
      message: 'Error parsing OCR text',
      error: error.message
    });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const updates = req.body;

    const expense = await Expense.findOne({
      _id: expenseId,
      employee: req.userId,
      status: 'pending' // Can only update pending expenses
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or cannot be updated'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['amount', 'currency', 'category', 'description', 'date', 'merchant', 'receipt'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        expense[field] = updates[field];
      }
    });

    // Recalculate converted amount if currency or amount changed
    if (updates.amount || updates.currency) {
      const company = await Company.findById(req.companyId);
      if (expense.currency !== company.currency) {
        expense.convertedAmount = await convertCurrency(
          expense.amount,
          expense.currency,
          company.currency
        );
      } else {
        expense.convertedAmount = expense.amount;
      }
    }

    await expense.save();
    await expense.populate('employee', 'username email');

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      employee: req.userId,
      status: 'pending' // Can only delete pending expenses
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};