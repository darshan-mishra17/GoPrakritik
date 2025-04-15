import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Lenis from '@studio-freight/lenis';
import { ShoppingCart } from "lucide-react";

export default function Shop() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarType, setSidebarType] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });
  const [activeCategory, setActiveCategory] = useState('All');
  const [_hoveredCardId, setHoveredCardId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);

  const sliderRef = useRef(null);
  const lenisRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [categories, setCategories] = useState(['All']);

  const fetchProducts = async (queryParams = {}) => {
    try {
      setLoading(true);
      
      const queryString = Object.keys(queryParams)
        .filter(key => queryParams[key])
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');
      
      const url = `http://localhost:8075/api/products${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success && result.data) {
        setProducts(result.data);
        setFilteredProducts(result.data);
        
        if (!queryParams.category) { 
          const uniqueCategories = ['All', ...new Set(result.data.map(product => product.category))];
          setCategories(uniqueCategories);
        }
      } else {
        setError('Failed to fetch product data');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      lenisRef.current = new Lenis({
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        infinite: false,
      });

      function raf(time) {
        if (lenisRef.current) {
          lenisRef.current.raf(time);
        }
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        if (lenisRef.current) {
          lenisRef.current.destroy();
        }
      };
    }
  }, [isMobile]);

  const handleTouchStart = (e) => {
    if (!sliderRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].pageX;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX;
    const walk = (x - startXRef.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    if (!sliderRef.current) return;
    e.preventDefault();
    
    if (isMobile) return;
    
    sliderRef.current.scrollBy({
      left: e.deltaY * 0.5,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sliderRef.current || !(e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
      e.preventDefault();
      
      const scrollAmount = e.key === 'ArrowRight' ? 300 : -300;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('touchstart', handleTouchStart, { passive: false });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchend', handleTouchEnd);

    return () => {
      slider.removeEventListener('touchstart', handleTouchStart);
      slider.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const queryParams = {};
    
    if (filters.category && filters.category !== 'All') {
      queryParams.category = filters.category;
    }
    
    if (filters.search) {
      queryParams.search = filters.search;
    }
    
    fetchProducts(queryParams);
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
    if (type === 'cart') {
      setSelectedProduct(null);
      setSidebarType(type);
      setSidebarOpen(true);
      return;
    }
    
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
      return 'NA';
    }
    return `Rs.${product.priceVariants[0].price}`;
  };

  const noScrollbarStyle = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };
  
  const getCardWidth = () => {
    if (isMobile) {
      return `calc(100vw - 60px)`;
    }
    return viewportWidth < 640 ? '160px' : '260px';
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
        <div className="backdrop-blur-sm bg-green-700/90 rounded-3xl md:rounded-3xl shadow-xl w-full h-full max-w-[95%] sm:max-w-[90%] max-h-[95vh] sm:max-h-[90vh] flex flex-col py-2 md:py-4">
          <Navbar openSidebar={openSidebar} />
          
          <div className="px-2 sm:px-4 md:px-6 py-1 md:py-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2 md:mb-4">
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
                  className="w-full px-2 sm:px-4 py-1 sm:py-2 text-base sm:text-sm sm:rounded-lg lg:rounded-full rounded-lg md:rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="w-full flex-1 overflow-hidden pt-0">
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
                    onClick={() => fetchProducts()}
                    className="mt-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-white text-green-700 rounded-full hover:bg-green-100 transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {!loading && !error && (
                <div className="flex-1 flex flex-col">
                  {filteredProducts.length > 0 ? (
                    <div className="relative w-full flex-1">
                      <div 
                        ref={sliderRef}
                        className={`flex-1 overflow-x-auto no-scrollbar flex items-center`}
                        style={noScrollbarStyle}
                        onWheel={handleWheel}
                      >
                        <div className={`flex items-center space-x-4 sm:space-x-5 md:space-x-6 px-4 sm:px-5 md:px-6 pb-2 sm:pb-4`}>
                          {filteredProducts.map((product, index) => (
                            <div
                              key={product._id}
                              className={`product-card 
                                       bg-white/10 
                                       rounded-lg 
                                       p-2 sm:p-3 md:p-4 
                                       border border-white/20 
                                       flex-shrink-0 
                                       h-[400px] md:h-[380px] 
                                       fade-in`}
                              style={{ 
                                animationDelay: `${index * 0.1}s`,
                                width: getCardWidth(),
                              }}
                              onMouseEnter={() => setHoveredCardId(product._id)}
                              onMouseLeave={() => setHoveredCardId(null)}
                            >
                              <div className="w-full h-56 md:h-44 overflow-hidden my-4 sm:my-2 md:my-3 rounded-lg transition-all duration-300">
                                <img
                                  src="./assets/testimg.png" 
                                  alt={product.productName}
                                  className={'w-full h-full object-contain transition-transform duration-500' }
                                />
                              </div>
                              <div className="flex justify-between items-center my-4 sm:my-3 ">
                                <h3 className="text-xl sm:text-sm md:text-lg font-semibold text-white truncate">
                                  {product.productName}
                                </h3>
                                <span className="text-xl sm:text-xs md:text-base text-white">
                                  {getBasePrice(product)}
                                </span>
                              </div>
                              
                              <div className="space-y-1 sm:space-y-2 mt-auto">
                                <button 
                                  className="btn-hover-effect w-full py-0.5 sm:py-1 md:py-1.5 text-xl sm:text-xs bg-transparent text-white border border-white rounded-full font-medium transition-all duration-300 hover:bg-white hover:text-green-700"
                                  onClick={() => openSidebar(product._id, 'details')}
                                >
                                  <span>Details</span>
                                </button>
                                <button 
                                  className="btn-hover-effect w-full py-0.5 sm:py-1 md:py-1.5 text-xl sm:text-xs bg-transparent text-white border border-white rounded-full font-medium transition-all duration-300 hover:bg-white hover:text-green-700"
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