import { buildProductFilter } from "./productFilter.js";
export const queryProducts = async (Model, query) => {
    const {
      sort,
      page = 1,
      limit = 10
    } = query;
  
    const filter = buildProductFilter(query);
  
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
      Model.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Model.countDocuments(filter)
    ]);
  
    return {
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products
    };
  };
  