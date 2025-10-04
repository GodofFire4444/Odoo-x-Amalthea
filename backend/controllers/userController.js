const User = require('../models/User');

// Get all employees in company
exports.getAllEmployees = async (req, res) => {
  try {
    const users = await User.find({ 
      company: req.companyId,
      _id: { $ne: req.userId } // Exclude current user
    })
      .populate('manager', 'username email')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
};

// Create new employee/manager
exports.createEmployee = async (req, res) => {
  try {
    const { username, email, password, role, manager, isManagerApprover } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Validate role
    if (!['employee', 'manager'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be employee or manager'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role,
      company: req.companyId,
      manager: manager || null,
      isManagerApprover: isManagerApprover || false
    });

    await user.save();

    await user.populate('manager', 'username email');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
};

// Update employee role
exports.updateEmployee = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, manager, isManagerApprover } = req.body;

    // Find user
    const user = await User.findOne({
      _id: userId,
      company: req.companyId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (role) user.role = role;
    if (manager !== undefined) user.manager = manager;
    if (isManagerApprover !== undefined) user.isManagerApprover = isManagerApprover;

    await user.save();
    await user.populate('manager', 'username email');

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOneAndDelete({
      _id: userId,
      company: req.companyId,
      role: { $ne: 'admin' } // Cannot delete admin
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
};

// Get all managers
exports.getManagers = async (req, res) => {
  try {
    const managers = await User.find({
      company: req.companyId,
      role: { $in: ['manager', 'admin'] }
    })
      .select('username email role')
      .sort({ username: 1 });

    res.json({
      success: true,
      data: { managers }
    });

  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching managers',
      error: error.message
    });
  }
};