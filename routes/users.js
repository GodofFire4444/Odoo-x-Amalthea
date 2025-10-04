const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all employees (Admin/Manager)
router.get('/', roleCheck('admin', 'manager'), userController.getAllEmployees);

// Get all managers
router.get('/managers', userController.getManagers);

// Create employee (Admin only)
router.post('/', roleCheck('admin'), userController.createEmployee);

// Update employee (Admin only)
router.put('/:userId', roleCheck('admin'), userController.updateEmployee);

// Delete employee (Admin only)
router.delete('/:userId', roleCheck('admin'), userController.deleteEmployee);

module.exports = router;