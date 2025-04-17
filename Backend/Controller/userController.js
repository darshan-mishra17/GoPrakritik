import User from '../Models/User.js';
import { Product, SpiceProduct, AttarProduct } from '../Models/Product.js';

// Error handler utility
const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'Server Error' 
  });
};

const UserController = {
  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({}).select('-password');
      res.status(200).json({ 
        success: true, 
        count: users.length, 
        data: users 
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get single user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
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
  updateUser: async (req, res) => {
    try {
      // Prevent updating sensitive fields
      const { password, isAdmin, ...updateData } = req.body;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { 
          new: true,
          runValidators: true 
        }
      ).select('-password');
      
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
      handleError(res, error, 400);
    }
  },

  // Delete user (admin only)
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Add new address to user
  addAddress: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { $push: { addresses: req.body } },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        data: user.addresses 
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  // Update existing address
  updateAddress: async (req, res) => {
    try {
      const { userId, addressId } = req.params;
      
      // Find the user first
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Find the address index
      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );
      
      if (addressIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'Address not found' 
        });
      }
      
      // Update the address
      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex].toObject(),
        ...req.body
      };
      
      await user.save();
      
      res.status(200).json({ 
        success: true, 
        data: user.addresses 
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  // Delete address
  deleteAddress: async (req, res) => {
    try {
      const { userId, addressId } = req.params;
      
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { addresses: { _id: addressId } } },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        data: user.addresses 
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get user's order history
  getOrderHistory: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .select('orderHistory');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        count: user.orderHistory.length, 
        data: user.orderHistory 
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get single order from history
  getSingleOrder: async (req, res) => {
    try {
      const user = await User.findOne(
        { 
          _id: req.params.userId,
          'orderHistory._id': req.params.orderId 
        },
        { 
          'orderHistory.$': 1 
        }
      );
      
      if (!user || !user.orderHistory || user.orderHistory.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        data: user.orderHistory[0] 
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

export default UserController;