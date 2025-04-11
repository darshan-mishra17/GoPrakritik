import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function Shop() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarType, setSidebarType] = useState(''); // 'details' or 'buy'

  const products = [
    {
      id: 1,
      name: "Organic Ghee",
      price: "Rs.550",
      image: "./assets/testimg.png",
      details: "Details",
      buyNow: "Buy Now"
    },
    {
      id: 2,
      name: "Organic Raw Honey",
      price: "Rs.750",
      image: "./assets/testimg.png",
      details: "Details",
      buyNow: "Buy Now"
    },
    {
      id: 3,
      name: "Himalayan Pink Salt",
      price: "Rs.579",
      image: "./assets/testimg.png",
      details: "Details",
      buyNow: "Buy Now"
    },
    {
      id: 4,
      name: "Organic Ghee",
      price: "Rs.550",
      image: "./assets/testimg.png",
      details: "Details",
      buyNow: "Buy Now"
    },
    {
      id: 5,
      name: "Organic Raw Honey",
      price: "Rs.750",
      image: "./assets/testimg.png",
      details: "Details",
      buyNow: "Buy Now"
    },
    {
      id: 6,
      name: "Himalayan Pink Salt",
      price: "Rs.579",
      image: "./assets/testimg.png",
      details: "Details",
      buyNow: "Buy Now"
    },
  ];

  // Function to open sidebar with product info
  const openSidebar = (product, type) => {
    setSelectedProduct(product);
    setSidebarType(type);
    setSidebarOpen(true);
  };

  // Function to close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedProduct(null);
  };

  // CSS class to hide scrollbar
  const noScrollbarStyle = {
    scrollbarWidth: 'none', /* Firefox */
    msOverflowStyle: 'none', /* IE and Edge */
  };
  
  // Apply ::-webkit-scrollbar to hide for Chrome, Safari and Opera
  const webkitScrollbarStyle = `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;

  return (
<div className={`relative w-full h-screen overflow-hidden ${sidebarOpen ? 'opacity-70' : 'opacity-100'} transition-opacity duration-300`}>      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("./assets/bg.png")',
          zIndex: -1,
        }}
      />
      
      <div className='flex items-center justify-center w-full h-full transition-all duration-300'>
        <div className="backdrop-blur-sm bg-green-700/90 rounded-3xl shadow-xl w-full h-full max-w-[90%] max-h-[90vh] flex flex-col md:py-4">
          <Navbar />
          <div className="w-full flex-1 overflow-hidden">
            <style>{webkitScrollbarStyle}</style>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-x-auto no-scrollbar" style={noScrollbarStyle}>
                <div className="flex">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex-none bg-transparent border-1 border-white p-6"
                      style={{
                        minWidth: '25%',
                        flex: '0 0 auto',
                      }}
                    >
                      <div className="w-full h-full md:h-56 lg:h-66 overflow-hidden mb-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg sm:text-xl font-semibold text-white">{product.name}</h3>
                        <span className="text-lg sm:text-xl text-white">{product.price}</span>
                      </div>
                      <div className="space-y-3">
                        <button 
                          className="w-full py-2 bg-transparent text-white border border-white rounded-full font-medium hover:bg-green-600 transition-colors"
                          onClick={() => openSidebar(product, 'details')}
                        >
                          {product.details}
                        </button>
                        <button 
                          className="w-full py-2 bg-transparent text-white border border-white rounded-full font-medium hover:bg-green-600 transition-colors"
                          onClick={() => openSidebar(product, 'buy')}
                        >
                          {product.buyNow}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar component */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        product={selectedProduct} 
        sidebarType={sidebarType} 
      />

      {/* Transparent overlay to handle clicks */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}