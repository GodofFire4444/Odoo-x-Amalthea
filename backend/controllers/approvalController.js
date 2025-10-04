const ApprovalRule = require('../models/ApprovalRule');
const Expense = require('../models/Expense');
const User = require('../models/User');

// Create approval rule
exports.createApprovalRule = async (req, res) => {
  try {
    const { name, type, approvers, percentageRequired, specificApprovers, amountThreshold } = req.body;

    // Validate input
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rule name and type'
      });
    }

    // Validate based on type
    if (type === 'sequential' && (!approvers || approvers.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Sequential rules require approvers'
      });
    }

    if (type === 'percentage' && !percentageRequired) {
      return res.status(400).json({
        success: false,
        message: 'Percentage rules require percentage value'
      });
    }

    if (type === 'specific_approver' && (!specificApprovers || specificApprovers.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Specific approver rules require at least one approver'
      });
    }

    const rule = new ApprovalRule({
      company: req.companyId,
      name,
      type,
      approvers,
      percentageRequired,
      specificApprovers,
      amountThreshold
    });

    await rule.save();
    await rule.populate('approvers.user', 'username email role');
    await rule.populate('specificApprovers', 'username email role');

    res.status(201).json({
      success: true,
      message: 'Approval rule created successfully',
      data: { rule }
    });

  } catch (error) {
    console.error('Create approval rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating approval rule',
      error: error.message
    });
  }
};

// Get all approval rules
exports.getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ company: req.companyId })
      .populate('approvers.user', 'username email role')
      .populate('specificApprovers', 'username email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { rules }
    });

  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approval rules',
      error: error.message
    });
  }
};

// Update approval rule
exports.updateApprovalRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;

    const rule = await ApprovalRule.findOne({
      _id: ruleId,
      company: req.companyId
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Approval rule not found'
      });
    }

    // Update fields
    const allowedUpdates = ['name', 'type', 'approvers', 'percentageRequired', 'specificApprovers', 'amountThreshold', 'isActive'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        rule[field] = updates[field];
      }
    });

    await rule.save();
    await rule.populate('approvers.user', 'username email role');
    await rule.populate('specificApprovers', 'username email role');

    res.json({
      success: true,
      message: 'Approval rule updated successfully',
      data: { rule }
    });

  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating approval rule',
      error: error.message
    });
  }
};

// Delete approval rule
exports.deleteApprovalRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    const rule = await ApprovalRule.findOneAndDelete({
      _id: ruleId,
      company: req.companyId
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Approval rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Approval rule deleted successfully'
    });

  } catch (error) {
    console.error('Delete approval rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting approval rule',
      error: error.message
    });
  }
};

// Approve or reject expense
exports.processExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { action, comment } = req.body;

    // Validate action
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be approved or rejected'
      });
    }

    const expense = await Expense.findOne({
      _id: expenseId,
      company: req.companyId
    }).populate('employee', 'username email manager isManagerApprover');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Expense has already been processed'
      });
    }

    // Check if user has permission to approve
    const canApprove = await checkApprovalPermission(req.user, expense);
    
    if (!canApprove) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve this expense'
      });
    }

    // Add to approval history
    expense.approvalHistory.push({
      approver: req.userId,
      action,
      comment,
      date: new Date()
    });

    // Check if manager approval is required first
    if (expense.employee.isManagerApprover && 
        expense.employee.manager && 
        expense.currentApproverStep === 0) {
      
      if (expense.employee.manager.toString() === req.userId.toString()) {
        if (action === 'approved') {
          expense.currentApproverStep = 1;
          // Check for additional approval rules
          const finalStatus = await evaluateApprovalRules(expense, req.companyId);
          expense.status = finalStatus;
        } else {
          expense.status = 'rejected';
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Manager approval required first'
        });
      }
    } else {
      // Process based on approval rules
      if (action === 'rejected') {
        expense.status = 'rejected';
      } else {
        const finalStatus = await evaluateApprovalRules(expense, req.companyId);
        expense.status = finalStatus;
      }
    }

    await expense.save();
    await expense.populate('employee', 'username email');
    await expense.populate('approvalHistory.approver', 'username email role');

    res.json({
      success: true,
      message: `Expense ${action} successfully`,
      data: { expense }
    });

  } catch (error) {
    console.error('Process expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing expense',
      error: error.message
    });
  }
};

// Helper: Check if user can approve expense
const checkApprovalPermission = async (user, expense) => {
  // Admin can approve anything
  if (user.role === 'admin') return true;

  // Manager can approve if they are the employee's manager
  if (user.role === 'manager') {
    if (expense.employee.manager && 
        expense.employee.manager.toString() === user._id.toString()) {
      return true;
    }
  }

  // Check approval rules
  const rules = await ApprovalRule.find({
    company: expense.company,
    isActive: true
  });

  for (const rule of rules) {
    // Check amount threshold
    if (rule.amountThreshold) {
      if (expense.convertedAmount < rule.amountThreshold.min) continue;
      if (rule.amountThreshold.max && expense.convertedAmount > rule.amountThreshold.max) continue;
    }

    // Check if user is in approvers list
    if (rule.type === 'sequential') {
      const isApprover = rule.approvers.some(a => 
        a.user.toString() === user._id.toString()
      );
      if (isApprover) return true;
    }

    // Check if user is specific approver
    if (rule.type === 'specific_approver' || rule.type === 'hybrid') {
      const isSpecificApprover = rule.specificApprovers.some(a => 
        a.toString() === user._id.toString()
      );
      if (isSpecificApprover) return true;
    }
  }

  return false;
};

// Helper: Evaluate approval rules
const evaluateApprovalRules = async (expense, companyId) => {
  const rules = await ApprovalRule.find({
    company: companyId,
    isActive: true
  }).populate('approvers.user specificApprovers');

  if (rules.length === 0) {
    return 'approved'; // No rules, auto-approve
  }

  for (const rule of rules) {
    // Check amount threshold
    if (rule.amountThreshold) {
      if (expense.convertedAmount < rule.amountThreshold.min) continue;
      if (rule.amountThreshold.max && expense.convertedAmount > rule.amountThreshold.max) continue;
    }

    const approvedBy = expense.approvalHistory
      .filter(h => h.action === 'approved')
      .map(h => h.approver.toString());

    // Sequential approval
    if (rule.type === 'sequential') {
      const currentStep = expense.currentApproverStep || 0;
      if (currentStep < rule.approvers.length) {
        const nextApprover = rule.approvers.find(a => a.sequence === currentStep + 1);
        if (approvedBy.includes(nextApprover.user._id.toString())) {
          expense.currentApproverStep = currentStep + 1;
          if (expense.currentApproverStep >= rule.approvers.length) {
            return 'approved';
          }
        }
        return 'pending';
      }
    }

    // Percentage approval
    if (rule.type === 'percentage') {
      const totalApprovers = rule.approvers.length;
      const approvedCount = rule.approvers.filter(a => 
        approvedBy.includes(a.user._id.toString())
      ).length;
      
      const percentage = (approvedCount / totalApprovers) * 100;
      if (percentage >= rule.percentageRequired) {
        return 'approved';
      }
    }

    // Specific approver
    if (rule.type === 'specific_approver') {
      const hasSpecificApproval = rule.specificApprovers.some(a => 
        approvedBy.includes(a._id.toString())
      );
      if (hasSpecificApproval) {
        return 'approved';
      }
    }

    // Hybrid (percentage OR specific approver)
    if (rule.type === 'hybrid') {
      const hasSpecificApproval = rule.specificApprovers.some(a => 
        approvedBy.includes(a._id.toString())
      );
      
      if (hasSpecificApproval) {
        return 'approved';
      }

      if (rule.percentageRequired && rule.approvers.length > 0) {
        const totalApprovers = rule.approvers.length;
        const approvedCount = rule.approvers.filter(a => 
          approvedBy.includes(a.user._id.toString())
        ).length;
        
        const percentage = (approvedCount / totalApprovers) * 100;
        if (percentage >= rule.percentageRequired) {
          return 'approved';
        }
      }
    }
  }

  return 'pending';
};