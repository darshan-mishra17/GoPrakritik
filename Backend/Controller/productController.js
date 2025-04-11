import { Product, SpiceProduct, AttarProduct } from '../Models/Product.js';

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

  // Get all products with filtering
  getAllProducts: async (req, res) => {
    try {
      const { 
        category, 
        isFeatured, 
        minPrice, 
        maxPrice,
        search,
        sort,
        page = 1,
        limit = 10
      } = req.query;

      // Build filter object
      const filter = {};
      if (category) filter.category = { $in: Array.isArray(category) ? category : [category] };
      if (isFeatured) filter.isFeatured = isFeatured === 'true';
      if (search) filter.productName = { $regex: search, $options: 'i' };
      
      // Price range filter
      if (minPrice || maxPrice) {
        filter['priceVariants.price'] = {};
        if (minPrice) filter['priceVariants.price'].$gte = Number(minPrice);
        if (maxPrice) filter['priceVariants.price'].$lte = Number(maxPrice);
      }

      // Sort options
      const sortOptions = {
        'price-asc': { 'priceVariants.price': 1 },
        'price-desc': { 'priceVariants.price': -1 },
        'newest': { createdAt: -1 },
        'oldest': { createdAt: 1 }
      };
      const sortBy = sortOptions[sort] || { createdAt: -1 };

      // Pagination
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort(sortBy)
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter)
      ]);

      res.status(200).json({ 
        success: true,
        count: products.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        data: products
      });
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

// Spice Product Controller
const SpiceProductController = {
  ...ProductController,
  
  // Create spice product
  createSpiceProduct: async (req, res) => {
    try {
      const product = await SpiceProduct.create(req.body);
      res.status(201).json({ 
        success: true, 
        data: product 
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  // Filter spice products
  filterSpiceProducts: async (req, res) => {
    try {
      const { variantName, benefit } = req.query;
      const filter = {};
      
      if (variantName) {
        filter['variantBenefits.variantName'] = { 
          $regex: variantName, 
          $options: 'i' 
        };
      }
      
      if (benefit) {
        filter['variantBenefits.benefits.description'] = { 
          $regex: benefit, 
          $options: 'i' 
        };
      }
      
      const spices = await SpiceProduct.find(filter);
      res.status(200).json({ 
        success: true, 
        count: spices.length, 
        data: spices 
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

// Attar Product Controller
const AttarProductController = {
  ...ProductController,
  
  // Create attar product
  createAttarProduct: async (req, res) => {
    try {
      const product = await AttarProduct.create(req.body);
      res.status(201).json({ 
        success: true, 
        data: product 
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  },

  // Filter attar products
  filterAttarProducts: async (req, res) => {
    try {
      const { fragranceNote, intensity } = req.query;
      const filter = {};
      
      if (fragranceNote) {
        filter.fragranceNotes = { 
          $regex: fragranceNote, 
          $options: 'i' 
        };
      }
      
      if (intensity) {
        filter.intensity = intensity;
      }
      
      const attars = await AttarProduct.find(filter);
      res.status(200).json({ 
        success: true, 
        count: attars.length, 
        data: attars 
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

export { ProductController, SpiceProductController, AttarProductController };