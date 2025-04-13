import express from 'express';
import OrderController from '../Controller/orderController.js';

const router = express.Router();

// Routes for orders
router.post('/', OrderController.createOrder); // Create order
router.get('/', OrderController.getAllOrders); // Admin - get all orders
router.get('/:id', OrderController.getOrderById); // Get single order by ID
router.get('/user/:userId', OrderController.getOrdersByUser); // Get orders for a user
router.put('/:id/status', OrderController.updateOrderStatus); // Update status
router.delete('/:id', OrderController.deleteOrder); // Cancel/delete order

export default router;
