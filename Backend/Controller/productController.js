import Product from '../Models/Product.js';
import { queryProducts } from '../Middleware/productSearch.js';

// Error handler utility
const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'Server Error' 
  });
};

// Base Product Controller
const ProductController = {
  // Create a new product
  createProduct: async (req, res) => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json({ 
        success: true, 
        data: product
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const result = await queryProducts(Product, req.query);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get single product by ID
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        data: product 
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { 
          new: true,
          runValidators: true 
        }
      );
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        data: product 
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }
      res.status(200).json({ 
        success: true, 
        message: 'Product deleted successfully' 
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

const SpiceProductController = {
  ...ProductController,

  createSpiceProduct: async (req, res) => {
    try {
      const productData = { ...req.body, category: 'spice' };
      const product = await SpiceProduct.create(productData);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  getAllSpiceProducts: async (req, res) => {
    try {
      req.query.category = 'spice';
      const result = await queryProducts(SpiceProduct, req.query);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
};

const AttarProductController = {
  ...ProductController,

  createAttarProduct: async (req, res) => {
    try {
      const productData = { ...req.body, category: 'attar' };
      const product = await AttarProduct.create(productData);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  getAllAttarProducts: async (req, res) => {
    try {
      req.query.category = 'attar';
      const result = await queryProducts(AttarProduct, req.query);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
};

export { ProductController, SpiceProductController, AttarProductController };
