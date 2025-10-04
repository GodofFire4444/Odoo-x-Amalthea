const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all expenses (Admin/Manager/Employee)
router.get('/', expenseController.getExpenses);

// Create expense (Employee/Manager)
router.post('/', expenseController.createExpense);

// Get pending approvals (Manager)
router.get('/pending/approvals', expenseController.getPendingApprovals);

// Parse OCR
router.post('/ocr/parse', expenseController.parseOCR);

// Get single expense
router.get('/:expenseId', expenseController.getExpense);

// Update expense
router.put('/:expenseId', expenseController.updateExpense);

// Delete expense
router.delete('/:expenseId', expenseController.deleteExpense);

module.exports = router;