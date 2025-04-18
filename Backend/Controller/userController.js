import User from '../Models/User.js';
import Order from '../Models/Order.js'; // Assuming you have an Order model
import mongoose from 'mongoose';

// Error handler utility
const handleError = (res, error, statusCode = 500) => {
  console.error('Error:', error.message);
  res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'Server Error' 
  });
};

const UserController = {
  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password');
      
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if ID is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is requesting their own data or is admin
      if (req.user.id !== id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own profile'
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

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone } = req.body;
      
      // Check if ID is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      // Check if user is updating their own data or is admin
      if (req.user.id !== id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own profile'
        });
      }
      
      // Find user and update
      const updatedUser = await User.findByIdAndUpdate(
        id,
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
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Delete user (admin only)
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if ID is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      const deletedUser = await User.findByIdAndDelete(id);
      
      if (!deletedUser) {
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

  // Add address to user
  addAddress: async (req, res) => {
    try {
      const { userId } = req.params;
      const addressData = req.body;
      
      // Check if userId is valid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      // Check if user is adding to their own profile
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only add addresses to your own profile'
        });
      }
      
      // Validate required address fields
      const requiredFields = ['fullName', 'phone', 'pincode', 'house', 'area', 'city', 'state'];
      for (const field of requiredFields) {
        if (!addressData[field]) {
          return res.status(400).json({
            success: false,
            message: `${field} is required for the address`
          });
        }
      }
      
      // Create a new address with a unique ID
      const newAddress = {
        _id: new mongoose.Types.ObjectId(),
        ...addressData
      };
      
      // Add address to user's addresses array
      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { addresses: newAddress } },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: newAddress
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Update address
  updateAddress: async (req, res) => {
    try {
      const { userId, addressId } = req.params;
      const addressData = req.body;
      
      // Check if IDs are valid
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }
      
      // Check if user is updating their own address
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own addresses'
        });
      }
      
      // Update the address
      const user = await User.findOneAndUpdate(
        { _id: userId, "addresses._id": addressId },
        { $set: { "addresses.$": { _id: addressId, ...addressData } } },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User or address not found'
        });
      }
      
      // Find the updated address
      const updatedAddress = user.addresses.find(addr => addr._id.toString() === addressId);
      
      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: updatedAddress
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Delete address
  deleteAddress: async (req, res) => {
    try {
      const { userId, addressId } = req.params;
      
      // Check if IDs are valid
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }
      
      // Check if user is deleting their own address
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own addresses'
        });
      }
      
      // Remove the address
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { addresses: { _id: addressId } } },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get order history
  getOrderHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Check if userId is valid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      // Check if user is requesting their own orders or is admin
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own orders'
        });
      }
      
      // Find orders for the user
      const orders = await Order.find({ userId })
        .sort({ orderDate: -1 })
        .populate('items.productId', 'productName');
      
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get single order
  getSingleOrder: async (req, res) => {
    try {
      const { userId, orderId } = req.params;
      
      // Check if IDs are valid
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }
      
      // Check if user is requesting their own order or is admin
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own orders'
        });
      }
      
      // Find the order
      const order = await Order.findOne({ _id: orderId, userId })
        .populate('items.productId', 'productName');
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

export default UserController;
