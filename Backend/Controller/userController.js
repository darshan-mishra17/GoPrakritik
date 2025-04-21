import User from '../Models/User.js';
import Order from '../Models/Order.js'; 
import mongoose from 'mongoose';
import {Product} from '../Models/Product.js';

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
  },

  // CART MANAGEMENT FUNCTIONS

  // Get user's cart
  getCart: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Check if userId is valid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      // Check if user is requesting their own cart or is admin
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own cart'
        });
      }
      
      // Find user and populate cart items with product details
      const user = await User.findById(userId)
        .select('cart')
        .populate('cart.productId');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Calculate cart total
      let cartTotal = 0;
      if (user.cart && user.cart.length > 0) {
        for (const item of user.cart) {
          if (item.productId && item.productId.priceVariants && 
              item.productId.priceVariants[item.selectedVariantIndex]) {
            const priceString = item.productId.priceVariants[item.selectedVariantIndex].price
              .toString().replace(/[^\d]/g, '');
            const price = parseInt(priceString, 10);
            cartTotal += price * item.quantity;
          }
        }
      }
      
      res.status(200).json({
        success: true,
        data: {
          items: user.cart,
          total: cartTotal
        }
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Add item to cart
  addToCart: async (req, res) => {
    try {
      const { userId } = req.params;
      const { productId, quantity = 1, selectedVariantIndex = 0 } = req.body;
      
      // Check if IDs are valid
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }
      
      // Check if user is updating their own cart or is admin
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own cart'
        });
      }
      
      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if product already exists in cart
      const cartItemIndex = user.cart.findIndex(item => 
        item.productId.toString() === productId && 
        item.selectedVariantIndex === selectedVariantIndex
      );
      
      let updatedUser;
      let message;
      
      if (cartItemIndex >= 0) {
        // Update quantity if item already exists
        user.cart[cartItemIndex].quantity += quantity;
        message = 'Cart item quantity updated';
      } else {
        // Add new item to cart
        user.cart.push({
          productId,
          quantity,
          selectedVariantIndex,
          addedAt: new Date()
        });
        message = 'Item added to cart';
      }
      
      // Save the updated user
      await user.save();
      
      // Get updated cart with product details
      updatedUser = await User.findById(userId)
        .select('cart')
        .populate('cart.productId');
      
      res.status(200).json({
        success: true,
        message,
        data: updatedUser.cart
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Update cart item quantity
  updateCartItem: async (req, res) => {
    try {
      const { userId } = req.params;
      const { productId, selectedVariantIndex = 0, quantity } = req.body;
      
      // Check if IDs are valid
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }
      
      // Check if user is updating their own cart or is admin
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own cart'
        });
      }
      
      // Validate quantity
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }
      
      // Find user and update cart item
      const user = await User.findOneAndUpdate(
        { 
          _id: userId, 
          "cart.productId": productId,
          "cart.selectedVariantIndex": selectedVariantIndex
        },
        { $set: { "cart.$.quantity": quantity } },
        { new: true }
      ).populate('cart.productId');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User or cart item not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Cart item updated',
        data: user.cart
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Remove item from cart
  removeFromCart: async (req, res) => {
    try {
      const { userId } = req.params;
      const { productId, selectedVariantIndex = 0 } = req.body;
      
      // Check if IDs are valid
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }
      
      // Check if user is updating their own cart or is admin
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own cart'
        });
      }
      
      // Find user and remove cart item
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $pull: { 
            cart: { 
              productId: productId,
              selectedVariantIndex: selectedVariantIndex
            } 
          } 
        },
        { new: true }
      ).populate('cart.productId');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: user.cart
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Clear cart
  clearCart: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Check if userId is valid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      // Check if user is updating their own cart or is admin
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own cart'
        });
      }
      
      // Find user and clear cart
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { cart: [] } },
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
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

export default UserController;
