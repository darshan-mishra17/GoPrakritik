import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Lenis from '@studio-freight/lenis';

const sampleProducts = [
  {
    _id: '1',
    productName: 'Organic Milk',
    description: 'Farm fresh organic milk Farm fresh organic milk Farm fresh organic milk Farm fresh organic milk',
    category: 'Dairy',
    priceVariants: [{ size: '1L', price: 80 }]
  },
  {
    _id: '2',
    productName: 'Turmeric Powder',
    description: 'Organic turmeric powder',
    category: 'Spice',
    priceVariants: [{ size: '100g', price: 60 }]
  },
  {
    _id: '3',
    productName: 'Aloe Vera Gel',
    description: 'Pure aloe vera gel',
    category: 'Personal Care',
    priceVariants: [{ size: '200ml', price: 150 }]
  },
  {
    _id: '4',
    productName: 'Honey',
    description: 'Raw organic honey',
    category: 'Sweetener',
    priceVariants: [{ size: '500g', price: 250 }]
  },
  {
    _id: '5',
    productName: 'Organic Ghee',
    description: 'Pure organic ghee',
    category: 'Dairy',
    priceVariants: [{ size: '250g', price: 300 }]
  },
  {
    _id: '6',
    productName: 'Cinnamon Sticks',
    description: 'Aromatic cinnamon sticks',
    category: 'Spice',
    priceVariants: [{ size: '50g', price: 90 }]
  },
  {
    _id: '7',
    productName: 'Almond Oil',
    description: 'Cold-pressed almond oil',
    category: 'Personal Care',
    priceVariants: [{ size: '100ml', price: 180 }]
  },
  {
    _id: '8',
    productName: 'Rock Salt',
    description: 'Himalayan pink rock salt',
    category: 'Seasoning',
    priceVariants: [{ size: '250g', price: 120 }]
  }
];

export default function Shop() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarType, setSidebarType] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });
  const [activeCategory, setActiveCategory] = useState('All');
  const [_hoveredCardId, setHoveredCardId] = useState(null);
  

  const sliderRef = useRef(null);
  const lenisRef = useRef(null);

  const categories = ['All', 'Dairy', 'Spice', 'Herbal', 'Sweetener', 'Seasoning', 'Personal Care'];

  useEffect(() => {
    // Initialize Lenis with spring-like smooth scrolling
    lenisRef.current = new Lenis({
      duration: 0.8, // Reduced from 1.2 for faster response
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      infinite: false,
    });

    function raf(time) {
      lenisRef.current.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  // Improved wheel handler with increased scroll speed
  const handleWheel = (e) => {
    if (sliderRef.current) {
      e.preventDefault();
      
      // Increased multiplier for faster scrolling (from 2 to 6)
      const scrollAmount = e.deltaY * 6;
      
      // Add smooth scrolling behavior
      sliderRef.current.scrollTo({
        left: sliderRef.current.scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Add horizontal scroll with keyboard arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (sliderRef.current && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const scrollAmount = e.key === 'ArrowRight' ? 300 : -300;
        sliderRef.current.scrollTo({
          left: sliderRef.current.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Add touch scroll optimization
  useEffect(() => {
    let startX;
    let scrollLeft;
    
    const handleTouchStart = (e) => {
      if (!sliderRef.current) return;
      startX = e.touches[0].pageX - sliderRef.current.offsetLeft;
      scrollLeft = sliderRef.current.scrollLeft;
    };
    
    const handleTouchMove = (e) => {
      if (!sliderRef.current || !startX) return;
      const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll faster on touch
      sliderRef.current.scrollLeft = scrollLeft - walk;
    };
    
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('touchstart', handleTouchStart, { passive: true });
      slider.addEventListener('touchmove', handleTouchMove, { passive: true });
      
      return () => {
        slider.removeEventListener('touchstart', handleTouchStart);
        slider.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let filteredProducts = [...sampleProducts];
        
        if (filters.category && filters.category !== 'All') {
          filteredProducts = filteredProducts.filter(
            product => product.category === filters.category
          );
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredProducts = filteredProducts.filter(
            product => 
              product.productName.toLowerCase().includes(searchLower) || 
              (product.description && product.description.toLowerCase().includes(searchLower))
          );
        }

        setTimeout(() => {
          setProducts(filteredProducts);
          setLoading(false);
        }, 300);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    handleFilterChange('category', category === 'All' ? '' : category);
    
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
    }
  };

  const openSidebar = (productId, type) => {
    const productDetails = products.find(p => p._id === productId);
    
    if (productDetails) {
      const formattedProduct = {
        ...productDetails,
        name: productDetails.productName,
        price: productDetails.priceVariants && productDetails.priceVariants.length > 0 
          ? `Rs.${productDetails.priceVariants[0].price}` 
          : 'Price not available',
        image: "./assets/testimg.png"
      };
      
      setSelectedProduct(formattedProduct);
      setSidebarType(type);
      setSidebarOpen(true);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setTimeout(() => {
      setSelectedProduct(null);
    }, 300);
  };

  const getBasePrice = (product) => {
    if (!product || !product.priceVariants || product.priceVariants.length === 0) {
      return 'Price not available';
    }
    return `Rs.${product.priceVariants[0].price}`;
  };

  const noScrollbarStyle = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };
  
  const webkitScrollbarStyle = `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    
    .no-scrollbar {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    
    .product-card {
      touch-action: pan-y;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    .sidebar-open { animation: slideIn 0.35s ease-out forwards; }
    .sidebar-close { animation: slideOut 0.3s ease-in forwards; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .fade-in { animation: fadeIn 0.5s ease-out forwards; }
    
    .btn-hover-effect {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .btn-hover-effect:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.4s ease;
      z-index: 0;
    }
    
    .btn-hover-effect:hover:before {
      left: 0;
    }
    
    .btn-hover-effect span {
      position: relative;
      z-index: 1;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }
    
    .category-btn-active {
      animation: pulse 2s infinite;
    }
    
    /* Add scroll indicator arrows */
    .scroll-indicator {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.3);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.3s ease;
    }
    
    .scroll-indicator:hover {
      background: rgba(0, 0, 0, 0.6);
    }
    
    .scroll-left {
      left: 10px;
    }
    
    .scroll-right {
      right: 10px;
    }

    
  `;


  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("./assets/bg.png")',
          zIndex: -1,
        }}
      />
      
      <div className='flex items-center justify-center w-full h-full transition-all duration-300'>
        <div className="backdrop-blur-sm bg-green-700/90 rounded-xl md:rounded-3xl shadow-xl w-full h-full max-w-[95%] sm:max-w-[90%] max-h-[95vh] sm:max-h-[90vh] flex flex-col py-2 md:py-4">
          <Navbar />
          
          <div className="px-2 sm:px-4 md:px-6 py-1 md:py-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2 md:mb-4">
              {/* Categories buttons with horizontal scroll for mobile */}
              <div className="flex flex-wrap gap-1 sm:gap-2 w-full overflow-x-auto no-scrollbar pb-1" style={noScrollbarStyle}>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`flex-shrink-0 text-xs sm:text-sm px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap transition-all duration-300 ${
                      activeCategory === category
                        ? 'bg-white text-green-700 category-btn-active'
                        : 'bg-transparent text-white border border-white hover:bg-white/20'
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="w-full sm:w-auto mt-1 sm:mt-0">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="w-full flex-1 overflow-hidden px-2 sm:px-4 md:px-6 pt-0">
            <style>{webkitScrollbarStyle}</style>
            <div className="h-full flex flex-col">
              {loading && (
                <div className="text-center py-2 sm:py-4">
                  <p className="text-white text-sm sm:text-base">Loading products...</p>
                </div>
              )}
              
              {error && (
                <div className="text-center py-2 sm:py-4">
                  <p className="text-white text-sm sm:text-base">Error loading products: {error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-white text-green-700 rounded-full hover:bg-green-100 transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {!loading && !error && (
                <div className="flex-1 flex flex-col">
                  {products.length > 0 ? (
                    <div className="relative w-full flex-1">
                      <div 
                        ref={sliderRef}
                        className="flex-1  overflow-x-auto no-scrollbar flex items-center"
                        style={noScrollbarStyle}
                        onWheel={handleWheel}
                      >
                        <div className="flex space-x-2 sm:space-x-4 md:space-x-6 pb-2 sm:pb-4  items-center">
                          {products.map((product, index) => (
                            <div
                              key={product._id}
                              className={`product-card bg-white/10 rounded-lg p-2 sm:p-3 md:p-4 border border-white/20 flex-shrink-0 w-[350px] sm:w-[180px] md:w-78 h-[440px] md:h-[400px]  fade-in`}
                              style={{ animationDelay: `${index * 0.1}s` }}
                              onMouseEnter={() => setHoveredCardId(product._id)}
                              onMouseLeave={() => setHoveredCardId(null)}
                            >
                              <div className="w-full h-54 my-8  md:h-48 overflow-hidden mb-1 sm:mb-2 md:mb-3 rounded-lg transition-all duration-300">
                                <img
                                  src="./assets/testimg.png" 
                                  alt={product.productName}
                                  className='w-full h-full object-contain transition-transform duration-500'
                                />
                              </div>
                              <div className="flex justify-between items-center m-4 sm:m-3 md:m-3">
                                <h3 className="text-xl sm:text-sm md:text-lg font-semibold text-white truncate">{product.productName}</h3>
                                <span className="text-xl sm:text-sm md:text-base text-white">
                                  {getBasePrice(product)}
                                </span>
                              </div>
                
                              <div className="space-y-1 sm:space-y-2 mt-auto">
                                <button 
                                  className="btn-hover-effect w-full py-0.5 sm:py-1 md:py-1.5 text-lg sm:text-sm bg-transparent text-white border border-white rounded-full font-medium transition-all duration-300 hover:bg-white hover:text-green-700"
                                  onClick={() => openSidebar(product._id, 'details')}
                                >
                                  <span>Details</span>
                                </button>
                                <button 
                                  className="btn-hover-effect w-full py-0.5 sm:py-1 md:py-1.5 text-lg sm:text-sm bg-transparent text-white border border-white rounded-full font-medium transition-all duration-300 hover:bg-white hover:text-green-700"
                                  onClick={() => openSidebar(product._id, 'buy')}
                                >
                                  <span>Buy Now</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-center py-6 sm:py-8 md:py-12">
                      <p className="text-white text-sm sm:text-base md:text-lg">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        product={selectedProduct} 
        sidebarType={sidebarType}
        animationClass={sidebarOpen ? "sidebar-open" : "sidebar-close"} 
      />

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          style={{ opacity: sidebarOpen ? 1 : 0 }}
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}