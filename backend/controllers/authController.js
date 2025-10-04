const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const axios = require('axios');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Get currency for country
const getCurrencyForCountry = async (countryName) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    const country = response.data.find(c => 
      c.name.common.toLowerCase() === countryName.toLowerCase()
    );
    
    if (country && country.currencies) {
      const currencyCode = Object.keys(country.currencies)[0];
      return currencyCode;
    }
    
    return 'USD'; // Default fallback
  } catch (error) {
    console.error('Error fetching currency:', error);
    return 'USD';
  }
};

// Sign Up
exports.signup = async (req, res) => {
  try {
    const { username, email, password, country } = req.body;

    // Validate input
    if (!username || !email || !password || !country) {
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

    // Get currency for selected country
    const currency = await getCurrencyForCountry(country);

    // Create company first
    const company = new Company({
      name: `${username}'s Company`,
      country,
      currency,
      admin: null // Will be updated after user creation
    });

    // Create user as admin
    const user = new User({
      username,
      email,
      password,
      role: 'admin',
      company: company._id
    });

    // Update company admin reference
    company.admin = user._id;

    // Save both
    await company.save();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Populate company details
    await user.populate('company');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Sign In
exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find user
    const user = await User.findOne({ username }).populate('company');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error signing in',
      error: error.message
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('company')
      .populate('manager', 'username email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};