import User from '../Models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Error handler utility
const handleError = (res, error, statusCode = 500) => {
  console.error('Error:', error.message);
  res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'Server Error' 
  });
};

const AuthController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      // Validate required fields
      if (!name || !email || !password || !phone) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Validate password strength (at least 8 characters with letters and numbers)
      if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and contain both letters and numbers'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or phone already exists'
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new User({
        name,
        email,
        phone,
        password: hashedPassword
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Return user data without password
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        data: userData
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Return user data without password
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: userData
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { name, phone } = req.body;
      
      // Find user and update
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { 
          $set: { 
            name: name || undefined,
            phone: phone || undefined
          } 
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validate required fields
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      // Validate password strength
      if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long and contain both letters and numbers'
        });
      }

      // Find user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      // Generate new token
      const newToken = jwt.sign(
        { id: req.user.id, isAdmin: req.user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        token: newToken
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

export default AuthController;
