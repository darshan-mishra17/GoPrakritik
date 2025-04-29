// routes/orderRoutes.js
import express from 'express';
const router = express.Router();
import createOrder from '../Controller/orderController.js'
//import authMiddleware from '../Middleware/authMiddleware.js';

router.post('/', createOrder);

export default router;