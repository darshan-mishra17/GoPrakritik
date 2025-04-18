import Order from '../Models/Order.js';
import User from '../Models/User.js';

// Error handler utility
const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

const OrderController = {
  // Create new order
  createOrder: async (req, res) => {
    try {
      const newOrder = new Order(req.body);
      const savedOrder = await newOrder.save();
      res.status(201).json({ success: true, data: savedOrder });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  // Get all orders (admin only)
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find().populate('user products.product');
      res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get single order by ID
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('user products.product');
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get orders by user
  getOrdersByUser: async (req, res) => {
    try {
      const orders = await Order.find({ user: req.params.userId }).populate('products.product');
      res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Update order status (e.g., from pending to shipped)
  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.status(200).json({ success: true, data: order });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  // Cancel/Delete order
  deleteOrder: async (req, res) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
      handleError(res, error);
    }
  }
};

export default OrderController;