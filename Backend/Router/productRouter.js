// productRouter.js
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

// Category-specific routes MUST come before the ID route
router.route('/spices')
  .post(SpiceProductController.createSpiceProduct)
  .get(SpiceProductController.getAllSpiceProducts);

router.route('/attars')
  .post(AttarProductController.createAttarProduct)
  .get(AttarProductController.getAllAttarProducts);

// ID-based routes (must come last)
router.route('/:id')
  .get(ProductController.getProductById)
  .put(ProductController.updateProduct)
  .delete(ProductController.deleteProduct);

export default router;