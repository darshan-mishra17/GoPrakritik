import express from 'express';
import UserController from '../Controller/userController.js';
import AuthController from '../Controller/AuthController.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import adminMiddleware from '../Middleware/adminMiddleware.js';

const router = express.Router();

// Auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.route('/')
  .get(authMiddleware, adminMiddleware, UserController.getAllUsers)
  .post(authMiddleware, adminMiddleware, UserController.createUser);

// User CRUD routes
router.route('/:id')
  .get(authMiddleware, UserController.getUserById)
  .put(authMiddleware, UserController.updateUser)
  .delete(authMiddleware, adminMiddleware, UserController.deleteUser);

// Address management routes
router.route('/:userId/addresses')
  .post(authMiddleware, UserController.addAddress);

router.route('/:userId/addresses/:addressId')
  .put(authMiddleware, UserController.updateAddress)
  .delete(authMiddleware, UserController.deleteAddress);

// Order history routes
router.route('/:userId/orders')
  .get(authMiddleware, UserController.getOrderHistory);

router.route('/:userId/orders/:orderId')
  .get(authMiddleware, UserController.getSingleOrder);

export default router;