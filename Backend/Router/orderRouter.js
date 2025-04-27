import express from 'express';
import { placeOrder } from '../Controller/orderController.js';

const router = express.Router();
router.post('/', placeOrder);

export default router;
