import express from 'express';
import UserController from '../Controller/userController.js';
import { authenticate, authorizeAdmin } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Admin-only routes
router.route('/')
  .get(authenticate, authorizeAdmin, UserController.getAllUsers);

// User CRUD routes
router.route('/:id')
  .get(authenticate, UserController.getUserById)
  .put(authenticate, UserController.updateUser)
  .delete(authenticate, authorizeAdmin, UserController.deleteUser);

// Address management routes
router.route('/:userId/addresses')
  .post(authenticate, UserController.addAddress);

router.route('/:userId/addresses/:addressId')
  .put(authenticate, UserController.updateAddress)
  .delete(authenticate, UserController.deleteAddress);

// Order history routes
router.route('/:userId/orders')
  .get(authenticate, UserController.getOrderHistory);

router.route('/:userId/orders/:orderId')
  .get(authenticate, UserController.getSingleOrder);

export default router;