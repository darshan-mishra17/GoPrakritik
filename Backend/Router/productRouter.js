import express from 'express';
import {
  ProductController,
  SpiceProductController,
  AttarProductController
} from '../Controller/productController.js';

const router = express.Router();

// Base Product Routes
router.route('/')
  .post(ProductController.createProduct)
  .get(ProductController.getAllProducts);

router.route('/:id')
  .get(ProductController.getProductById)
  .put(ProductController.updateProduct)
  .delete(ProductController.deleteProduct);

// Spice Product Routes
router.route('/spices')
  .post(SpiceProductController.createSpiceProduct)
  .get(SpiceProductController.getAllProducts);

router.get('/spices/filter', SpiceProductController.filterSpiceProducts);

// Attar Product Routes
router.route('/attars')
  .post(AttarProductController.createAttarProduct)
  .get(AttarProductController.getAllProducts);

router.get('/attars/filter', AttarProductController.filterAttarProducts);

export default router;