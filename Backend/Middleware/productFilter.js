export const buildProductFilter = (query) => {
    const {
      category,
      isFeatured,
      minPrice,
      maxPrice,
      search
    } = query;
  
    const filter = {};
  
    // Filter by category
    if (category) {
      filter.category = { $in: Array.isArray(category) ? category : [category] };
    }
  
    // Filter by featured
    if (isFeatured) {
      filter.isFeatured = isFeatured === 'true';
    }
  
    // Filter by product name (search)
    if (search) {
      filter.productName = { $regex: search, $options: 'i' };
    }
  
    // Price filtering
    if (minPrice || maxPrice) {
      filter['priceVariants.price'] = {};
      if (minPrice) filter['priceVariants.price'].$gte = Number(minPrice);
      if (maxPrice) filter['priceVariants.price'].$lte = Number(maxPrice);
    }
  
    return filter;
  };
  