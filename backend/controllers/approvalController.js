const ApprovalRule = require('../models/ApprovalRule');
const Expense = require('../models/Expense');
const User = require('../models/User');
const {
  buildApprovalSummary,
  buildWorkflowStages,
  didStageCompleteAfterAction,
  isUserAllowedForStage,
  selectApprovalRule,
  validateApprovalRuleInput,
} = require('../utils/approvalWorkflow');
const populateRule = (query) => query
  .populate('approvers.user', 'username email role')
  .populate('specificApprovers', 'username email role');
const validateRuleUsers = async (companyId, rulePayload) => {
  const ids = [
    ...(rulePayload.approvers || []).map((approver) => approver.user),
    ...(rulePayload.specificApprovers || [])
  ].filter(Boolean).map((value) => value.toString());

  if (ids.length === 0) {
    return [];
  }

  const users = await User.find({
    company: companyId,
    _id: { $in: ids }
  }).select('_id');
  return users.length === ids.length ? [] : ids.filter((id) => !users.some((user) => user._id.toString() === id));
};

const prepareRulePayload = async (companyId, body) => {
  const validation = validateApprovalRuleInput(body);

  if (!validation.valid) {
    return { validation };
  }
  const missingUsers = await validateRuleUsers(companyId, validation.normalized);
  if (missingUsers.length > 0) {
    return {
      validation: {
        valid: false,
        errors: ['approvers'],
        normalized: validation.normalized,
        message: 'All approvers must belong to the current company'
      }
    };
  }

  return { validation };
};

const buildErrorResponse = (res, validation) => res.status(400).json({
  success: false,
  message: validation.message || 'Invalid approval rule configuration',
  errors: validation.errors
});

// Create approval rule
exports.createApprovalRule = async (req, res) => {
  try {
    const { validation } = await prepareRulePayload(req.companyId, req.body);

    if (!validation.valid) {
      return buildErrorResponse(res, validation);
    }

    const rule = new ApprovalRule({
      company: req.companyId,
      ...validation.normalized
    });

    await rule.save();

    const populatedRule = await populateRule(ApprovalRule.findById(rule._id));

    res.status(201).json({
      success: true,
      message: 'Approval rule created successfully',
      data: { rule: await populatedRule }
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
    const rules = await populateRule(
      ApprovalRule.find({ company: req.companyId }).sort({ createdAt: -1 })
    );

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

    const candidatePayload = {
      name: req.body.name !== undefined ? req.body.name : rule.name,
      type: req.body.type !== undefined ? req.body.type : rule.type,
      approvers: req.body.approvers !== undefined ? req.body.approvers : rule.approvers,
      percentageRequired: req.body.percentageRequired !== undefined ? req.body.percentageRequired : rule.percentageRequired,
      specificApprovers: req.body.specificApprovers !== undefined ? req.body.specificApprovers : rule.specificApprovers,
      amountThreshold: req.body.amountThreshold !== undefined ? req.body.amountThreshold : rule.amountThreshold,
      isActive: req.body.isActive !== undefined ? req.body.isActive : rule.isActive
    };

    const { validation } = await prepareRulePayload(req.companyId, candidatePayload);

    if (!validation.valid) {
      return buildErrorResponse(res, validation);
    }

    Object.assign(rule, validation.normalized);
    await rule.save();

    const populatedRule = await populateRule(ApprovalRule.findById(rule._id));

    res.json({
      success: true,
      message: 'Approval rule updated successfully',
      data: { rule: await populatedRule }
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

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be approved or rejected'
      });
    }

    const expense = await Expense.findOne({
      _id: expenseId,
      company: req.companyId
    })
      .populate({
        path: 'employee',
        select: 'username email manager isManagerApprover role',
        populate: {
          path: 'manager',
          select: 'username email role'
        }
      })
      .populate({
        path: 'approvalRule',
        populate: [
          { path: 'approvers.user', select: 'username email role' },
          { path: 'specificApprovers', select: 'username email role' }
        ]
      })
      .populate('approvalHistory.approver', 'username email role');

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

    let rule = expense.approvalRule;
    if (!rule) {
      const companyRules = await ApprovalRule.find({ company: req.companyId, isActive: true })
        .populate('approvers.user', 'username email role')
        .populate('specificApprovers', 'username email role')
        .sort({ createdAt: 1 });

      rule = selectApprovalRule(companyRules, expense.convertedAmount ?? expense.amount);

      if (rule) {
        expense.approvalRule = rule._id;
      }
    }

    const stages = buildWorkflowStages(expense, rule);
    const currentStageIndex = expense.currentApproverStep || 0;
    const currentStage = stages[currentStageIndex] || null;

    if (!currentStage) {
      return res.status(400).json({
        success: false,
        message: 'No active approval step is configured for this expense'
      });
    }

    const permission = isUserAllowedForStage(req.user, expense, rule, currentStage, currentStageIndex);
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.reason
      });
    }

    // Double-check status hasn't changed (prevent race on % approvals)
    const freshCheck = await Expense.findById(expenseId);
    if (freshCheck.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: 'Expense was already processed by another approver. Please refresh.'
      });
    }

    expense.approvalHistory.push({
      step: currentStageIndex,
      stage: currentStage.kind,
      approver: req.userId,
      action,
      comment,
      date: new Date()
    });

    if (action === 'rejected') {
      expense.status = 'rejected';
    } else if (currentStage.kind === 'manager' || currentStage.kind === 'sequential') {
      expense.currentApproverStep = currentStageIndex + 1;
      expense.status = stages[expense.currentApproverStep] ? 'pending' : 'approved';
    } else if (didStageCompleteAfterAction(expense, rule, currentStage, currentStageIndex)) {
      expense.currentApproverStep = currentStageIndex + 1;
      expense.status = stages[expense.currentApproverStep] ? 'pending' : 'approved';
    }

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('employee', 'username email manager isManagerApprover role')
      .populate({
        path: 'approvalRule',
        populate: [
          { path: 'approvers.user', select: 'username email role' },
          { path: 'specificApprovers', select: 'username email role' }
        ]
      })
      .populate('approvalHistory.approver', 'username email role');

    res.json({
      success: true,
      message: `Expense ${action} successfully`,
      data: {
        expense: populatedExpense,
        approvalSummary: buildApprovalSummary(populatedExpense, populatedExpense.approvalRule)
      }
    });
  } catch (error) {
    if (error.name === 'VersionError') {
      return res.status(409).json({
        success: false,
        message: 'The expense was updated by another approver. Please reload and try again.'
      });
    }

    console.error('Process expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing expense',
      error: error.message
    });
  }
};