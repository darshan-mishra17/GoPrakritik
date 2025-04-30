import User from '../Models/User.js';
import mongoose from 'mongoose';

const handleError = (res, error, statusCode = 500) => {
  console.error('Error:', error.message);
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

const cartController = {
  // GET /api/user/:userId/cart
  getCart: async (req, res) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format',
        });
      }

      const user = await User.findById(userId).populate('cart.productId');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        cart: user.cart,
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // PUT /api/user/:userId/cart
  updateCart: async (req, res) => {
    try {
      const { userId } = req.params;
      const { productId, quantity = 1, selectedVariantIndex = 0 } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID or Product ID',
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const cartItemIndex = user.cart.findIndex(
        (item) => item.productId.toString() === productId && item.selectedVariantIndex === selectedVariantIndex
      );

      if (cartItemIndex > -1) {
        user.cart[cartItemIndex].quantity = quantity;
      } else {
        user.cart.push({ productId, quantity, selectedVariantIndex });
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Cart updated successfully',
        cart: user.cart,
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // DELETE /api/user/:userId/cart
  deleteCartItem: async (req, res) => {
    try {
      const { userId } = req.params;
      const { productId, selectedVariantIndex = 0 } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID or Product ID',
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const initialCartLength = user.cart.length;

      user.cart = user.cart.filter(
        (item) => !(item.productId.toString() === productId && item.selectedVariantIndex === selectedVariantIndex)
      );

      if (user.cart.length === initialCartLength) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in cart',
        });
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        cart: user.cart,
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

export default cartController;
