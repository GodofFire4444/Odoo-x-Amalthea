const toObjectIdString = (value) => (value && value.toString ? value.toString() : String(value || ''));

const APPROVAL_TYPES = new Set(['sequential', 'percentage', 'specific_approver', 'hybrid']);

const parseNumber = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeThreshold = (threshold = {}) => {
  const min = parseNumber(threshold.min, 0);
  const max = parseNumber(threshold.max, null);

  return {
    min: min ?? 0,
    ...(max !== null ? { max } : {})
  };
};

const normalizeSequentialApprovers = (approvers = []) => {
  const seen = new Set();
  const cleaned = approvers
    .map((approver, index) => {
      const userId = approver?.user || approver?.userId || approver?._id || approver;
      if (!userId) {
        return null;
      }

      return {
        user: userId,
        sequence: parseNumber(approver?.sequence, index + 1) || index + 1
      };
    })
    .filter(Boolean)
    .filter((approver) => {
      const stringId = toObjectIdString(approver.user);
      if (seen.has(stringId)) {
        return false;
      }

      seen.add(stringId);
      return true;
    })
    .sort((left, right) => left.sequence - right.sequence)
    .map((approver, index) => ({
      user: approver.user,
      sequence: index + 1
    }));

  return cleaned;
};

const normalizeSpecificApprovers = (approvers = []) => {
  const uniqueIds = [];

  approvers.forEach((approver) => {
    const userId = approver?.user || approver?.userId || approver?._id || approver;
    const stringId = toObjectIdString(userId);

    if (stringId && !uniqueIds.includes(stringId)) {
      uniqueIds.push(stringId);
    }
  });

  return uniqueIds;
};

const validateApprovalRuleInput = (input = {}) => {
  const errors = [];
  const normalizedType = input.type;

  if (!input.name || !String(input.name).trim()) {
    errors.push('name');
  }

  if (!APPROVAL_TYPES.has(normalizedType)) {
    errors.push('type');
  }

  const normalizedThreshold = input.amountThreshold ? normalizeThreshold(input.amountThreshold) : null;
  if (normalizedThreshold && normalizedThreshold.max !== undefined && normalizedThreshold.max < normalizedThreshold.min) {
    errors.push('amountThreshold');
  }

  const sequentialApprovers = normalizeSequentialApprovers(input.approvers || []);
  const specificApprovers = normalizeSpecificApprovers(input.specificApprovers || []);

  if (normalizedType === 'sequential' && sequentialApprovers.length === 0) {
    errors.push('approvers');
  }

  if ((normalizedType === 'percentage' || normalizedType === 'hybrid') && sequentialApprovers.length === 0 && specificApprovers.length === 0) {
    errors.push('approvers');
  }

  const percentageRequired = parseNumber(input.percentageRequired, null);

  if ((normalizedType === 'percentage' || normalizedType === 'hybrid') && percentageRequired === null && specificApprovers.length === 0) {
    errors.push('percentageRequired');
  }

  if (percentageRequired !== null && (percentageRequired < 1 || percentageRequired > 100)) {
    errors.push('percentageRequired');
  }

  if (normalizedType === 'specific_approver' && specificApprovers.length === 0) {
    errors.push('specificApprovers');
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized: {
      name: String(input.name || '').trim(),
      type: normalizedType,
      percentageRequired: parseNumber(input.percentageRequired, null),
      amountThreshold: normalizedThreshold,
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
      approvers: sequentialApprovers,
      specificApprovers,
    }
  };
};

const thresholdMatches = (rule, amount) => {
  const threshold = rule.amountThreshold || {};
  const min = parseNumber(threshold.min, 0) || 0;
  const max = parseNumber(threshold.max, null);

  if (amount < min) {
    return false;
  }

  if (max !== null && amount > max) {
    return false;
  }

  return true;
};

const selectApprovalRule = (rules = [], amount) => {
  const matchingRules = rules.filter((rule) => thresholdMatches(rule, amount));

  const sorted = matchingRules.sort((left, right) => {
    const leftMin = parseNumber(left.amountThreshold?.min, 0) || 0;
    const rightMin = parseNumber(right.amountThreshold?.min, 0) || 0;

    if (leftMin !== rightMin) {
      return rightMin - leftMin;
    }

    const leftMax = parseNumber(left.amountThreshold?.max, Number.MAX_SAFE_INTEGER) || Number.MAX_SAFE_INTEGER;
    const rightMax = parseNumber(right.amountThreshold?.max, Number.MAX_SAFE_INTEGER) || Number.MAX_SAFE_INTEGER;

    if (leftMax !== rightMax) {
      return leftMax - rightMax;
    }

    const leftCreated = new Date(left.createdAt || 0).getTime();
    const rightCreated = new Date(right.createdAt || 0).getTime();

    if (leftCreated !== rightCreated) {
      return leftCreated - rightCreated;
    }

    return toObjectIdString(left._id).localeCompare(toObjectIdString(right._id));
  });

  return sorted[0] || null;
};

const stageApproverIds = (stage) => stage.approvers.map((approver) => toObjectIdString(approver.user || approver));

const buildWorkflowStages = (expense, rule) => {
  const stages = [];

  if (expense.employee?.isManagerApprover && expense.employee?.manager) {
    stages.push({
      key: 'manager',
      kind: 'manager',
      label: 'Manager approval',
      approvers: [expense.employee.manager],
      requiredCount: 1
    });
  }

  if (!rule) {
    return stages;
  }

  if (rule.type === 'sequential') {
    const approvers = [...(rule.approvers || [])].sort((left, right) => left.sequence - right.sequence);
    approvers.forEach((approver, index) => {
      stages.push({
        key: `sequential-${index + 1}`,
        kind: 'sequential',
        label: `Step ${index + 1}`,
        approvers: [approver.user],
        sequence: index + 1,
        requiredCount: 1
      });
    });
    return stages;
  }

  if (rule.type === 'percentage') {
    const approvers = rule.approvers || [];
    stages.push({
      key: 'parallel-percentage',
      kind: 'parallel',
      ruleType: 'percentage',
      label: `${rule.percentageRequired || 100}% approval required`,
      approvers: approvers.map((approver) => approver.user),
      requiredCount: Math.max(1, Math.ceil((approvers.length * (rule.percentageRequired || 100)) / 100)),
      percentageRequired: rule.percentageRequired || 100
    });
    return stages;
  }

  if (rule.type === 'specific_approver') {
    stages.push({
      key: 'parallel-specific',
      kind: 'parallel',
      ruleType: 'specific_approver',
      label: 'Specific approver approval',
      approvers: rule.specificApprovers || [],
      requiredCount: 1
    });
    return stages;
  }

  if (rule.type === 'hybrid') {
    stages.push({
      key: 'parallel-hybrid',
      kind: 'parallel',
      ruleType: 'hybrid',
      label: 'Specific approver or percentage approval',
      approvers: [
        ...(rule.approvers || []).map((approver) => approver.user),
        ...(rule.specificApprovers || [])
      ],
      percentageApprovers: (rule.approvers || []).map((approver) => approver.user),
      specificApprovers: rule.specificApprovers || [],
      requiredCount: Math.max(1, Math.ceil(((rule.approvers || []).length * (rule.percentageRequired || 100)) / 100)),
      percentageRequired: rule.percentageRequired || null
    });
    return stages;
  }

  return stages;
};

const getStage = (expense, rule) => buildWorkflowStages(expense, rule)[expense.currentApproverStep || 0] || null;

const getStageHistory = (expense, stageIndex) =>
  (expense.approvalHistory || []).filter((entry) => Number(entry.step) === Number(stageIndex));

const getStageApprovalSummary = (expense, rule, stage, stageIndex) => {
  const history = getStageHistory(expense, stageIndex);
  const approved = history.filter((entry) => entry.action === 'approved');
  const rejected = history.filter((entry) => entry.action === 'rejected');

  if (!stage) {
    return null;
  }

  if (stage.kind === 'manager' || stage.kind === 'sequential') {
    return {
      label: stage.label,
      kind: stage.kind,
      approvers: stage.approvers,
      approved,
      rejected,
      requiredCount: 1,
      completed: approved.length > 0,
      pendingApprovers: approved.length > 0 ? [] : stage.approvers
    };
  }

  const eligibleApproverIds = stageApproverIds(stage);
  const approvedApproverIds = approved.map((entry) => toObjectIdString(entry.approver));
  const specificApproverIds = (stage.specificApprovers || []).map((approver) => toObjectIdString(approver));
  const percentageApproverIds = (stage.percentageApprovers || stage.approvers || []).map((approver) => toObjectIdString(approver));

  let completed = false;
  if (stage.ruleType === 'specific_approver') {
    completed = approved.length > 0;
  } else if (stage.ruleType === 'hybrid') {
    completed = approved.some((entry) => specificApproverIds.includes(toObjectIdString(entry.approver))) ||
      approvedApproverIds.filter((approverId) => percentageApproverIds.includes(approverId)).length >= stage.requiredCount;
  } else {
    completed = approvedApproverIds.filter((approverId) => eligibleApproverIds.includes(approverId)).length >= stage.requiredCount;
  }

  return {
    label: stage.label,
    kind: stage.kind,
    ruleType: stage.ruleType,
    approvers: stage.approvers,
    approved,
    rejected,
    requiredCount: stage.requiredCount,
    completed,
    percentageRequired: stage.percentageRequired || null,
    pendingApprovers: stage.approvers.filter((approver) => !approvedApproverIds.includes(toObjectIdString(approver)))
  };
};

const buildApprovalSummary = (expense, rule) => {
  const stages = buildWorkflowStages(expense, rule);
  const currentStageIndex = expense.status === 'pending' ? (expense.currentApproverStep || 0) : stages.length;
  const currentStage = stages[currentStageIndex] || null;
  const stageDetails = stages.map((stage, index) => {
    const stageSummary = getStageApprovalSummary(expense, rule, stage, index);
    return {
      ...stage,
      ...stageSummary,
      completed: index < currentStageIndex ? true : Boolean(stageSummary?.completed)
    };
  });

  const currentStageSummary = currentStage ? stageDetails[currentStageIndex] : null;

  return {
    ruleId: rule?._id || expense.approvalRule || null,
    ruleName: rule?.name || null,
    ruleType: rule?.type || null,
    currentStageIndex,
    currentStage,
    stages: stageDetails,
    history: [...(expense.approvalHistory || [])].sort((left, right) => new Date(left.date) - new Date(right.date)),
    stageSummary: currentStageSummary,
    approvedBy: (expense.approvalHistory || []).filter((entry) => entry.action === 'approved'),
    rejectedBy: (expense.approvalHistory || []).filter((entry) => entry.action === 'rejected')
  };
};

const isUserAllowedForStage = (user, expense, rule, stage, stageIndex) => {
  if (!stage) {
    return { allowed: false, reason: 'No active approval stage' };
  }

  const userId = toObjectIdString(user._id || user);
  const history = getStageHistory(expense, stageIndex);
  const alreadyActed = history.some((entry) => toObjectIdString(entry.approver) === userId);

  if (alreadyActed) {
    return { allowed: false, reason: 'You already acted on this step' };
  }

  if (stage.kind === 'manager') {
    const managerId = toObjectIdString(expense.employee?.manager);
    return managerId && managerId === userId
      ? { allowed: true }
      : { allowed: false, reason: 'Manager approval required first' };
  }

  const allowedIds = stageApproverIds(stage);
  if (allowedIds.includes(userId)) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'You do not have permission to approve this step' };
};

const didStageCompleteAfterAction = (expense, rule, stage, stageIndex) => {
  if (!stage) {
    return false;
  }

  const history = getStageHistory(expense, stageIndex);
  const approved = history.filter((entry) => entry.action === 'approved');

  if (stage.kind === 'manager' || stage.kind === 'sequential') {
    return approved.length > 0 || history.some((entry) => entry.action === 'rejected');
  }

  const approvedIds = approved.map((entry) => toObjectIdString(entry.approver));
  if (stage.ruleType === 'specific_approver') {
    return approved.length > 0;
  }

  if (stage.ruleType === 'hybrid') {
    const specificApproverIds = (stage.specificApprovers || []).map((approver) => toObjectIdString(approver));
    const percentageApproverIds = (stage.percentageApprovers || stage.approvers || []).map((approver) => toObjectIdString(approver));

    return approved.some((entry) => specificApproverIds.includes(toObjectIdString(entry.approver))) ||
      approvedIds.filter((approverId) => percentageApproverIds.includes(approverId)).length >= stage.requiredCount;
  }

  const allowedIds = stageApproverIds(stage);
  return approvedIds.filter((approverId) => allowedIds.includes(approverId)).length >= stage.requiredCount;
};

module.exports = {
  APPROVAL_TYPES,
  buildApprovalSummary,
  buildWorkflowStages,
  didStageCompleteAfterAction,
  getStage,
  isUserAllowedForStage,
  normalizeApprovalRuleInput: validateApprovalRuleInput,
  normalizeSpecificApprovers,
  normalizeSequentialApprovers,
  normalizeThreshold,
  selectApprovalRule,
  thresholdMatches,
  validateApprovalRuleInput,
};