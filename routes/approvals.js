const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Approval rules CRUD (Admin only)
router.get('/rules', roleCheck('admin'), approvalController.getApprovalRules);
router.post('/rules', roleCheck('admin'), approvalController.createApprovalRule);
router.put('/rules/:ruleId', roleCheck('admin'), approvalController.updateApprovalRule);
router.delete('/rules/:ruleId', roleCheck('admin'), approvalController.deleteApprovalRule);

// Approve/reject expense (Manager/Admin)
router.post('/expenses/:expenseId', roleCheck('manager', 'admin'), approvalController.processExpense);

module.exports = router;
