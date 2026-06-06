const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: true, message: 'User already exists', code: 'BAD_REQUEST' });
    }

    const user = await User.create({ name, email, password, role });
    
    // Check if the user registered as a vendor
    if (role.toLowerCase() === 'vendor') {
      const Vendor = require('../models/Vendor');
      await Vendor.create({
        name: user.name || 'New Vendor',
        email: user.email,
        contactPerson: user.name || 'New Vendor',
        status: 'Active',
        linkedUserId: user._id,
        category: 'Uncategorized',
        gst: 'PENDING',
        phone: 'PENDING'
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: true, message: 'Invalid credentials', code: 'UNAUTHENTICATED' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: true, message: 'Account is deactivated', code: 'FORBIDDEN' });
    }

    const token = generateToken(user._id);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Mock implementation for forgot password
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};
