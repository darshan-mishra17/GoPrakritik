import express from 'express';
import UserController from '../Controller/userController.js';
// import { authenticate, authorizeAdmin } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Admin-only routes
router.route('/')
  .get(UserController.getAllUsers);

// User CRUD routes
router.route('/:id')
  .get( UserController.getUserById)
  .put(UserController.updateUser)
  .delete(UserController.deleteUser);

// Address management routes
router.route('/:userId/addresses')
  .post(UserController.addAddress);

router.route('/:userId/addresses/:addressId')
  .put(UserController.updateAddress)
  .delete(UserController.deleteAddress);

// Order history routes
router.route('/:userId/orders')
  .get(UserController.getOrderHistory);

router.route('/:userId/orders/:orderId')
  .get(UserController.getSingleOrder);

export default router;