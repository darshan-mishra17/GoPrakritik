import React, { useState, useEffect } from 'react';

export default function Sidebar({ isOpen, onClose, product, sidebarType }) {
  const [quantity, setQuantity] = useState(1);
  const [subtotal, setSubtotal] = useState(0);
  
  // Update subtotal when quantity or product changes
  useEffect(() => {
    if (product) {
      // Remove 'Rs.' prefix and convert to number
      // This properly parses the price value without decimal errors
      const priceString = product.price.replace(/[^\d]/g, '');
      const priceValue = parseInt(priceString, 10);
      
      // Calculate subtotal and ensure it's not subject to floating point errors
      const calculatedSubtotal = priceValue * quantity;
      setSubtotal(calculatedSubtotal);
    }
  }, [quantity, product]);

  if (!product) return null;

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleRemove = () => {
    // Handle item removal
    setQuantity(0);
    onClose();
  };

  const renderProductDetails = () => (
    <div className="flex-1 overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4">Product Details</h3>
      
      {/* Product Image */}
      <div className="mb-6 w-[25%] h-[25%] overflow-hidden">
        <img 
          src={product.image || "/api/placeholder/200/200"} 
          alt={product.name} 
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      
      {/* Details */}
      <div className="mb-6">
        <p className="mb-4">{product.description}</p>
        
        {/* Expandable Sections */}
        <div className="border-t border-gray-200 py-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Organic Processing Method</span>
            <span>+</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 py-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Traditional Methods</span>
            <span>+</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 py-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Benefits</span>
            <span>+</span>
          </div>
        </div>
        
        <div className="border-t border-b border-gray-200 py-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Usage</span>
            <span>+</span>
          </div>
        </div>
      </div>
      
      {/* Quantity Selector */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-medium">Quantity</span>
        <div className="flex items-center border rounded-full overflow-hidden">
          <button 
            onClick={decrementQuantity}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            -
          </button>
          <span className="px-3 py-1">{quantity}</span>
          <button 
            onClick={incrementQuantity}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-auto">
        <button 
          className="w-full py-3 mb-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-center"
        >
          Add to Cart
        </button>
        <button 
          className="w-full py-3 bg-green-700 text-white rounded-full hover:bg-green-400 text-center"
        >
          Checkout
        </button>
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="flex-1 flex flex-col">
      <h3 className="text-xl font-semibold mb-4">Cart</h3>
      
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center">
            {/* Product Image */}
            <div className="w-16 h-16 border border-blue-300 rounded overflow-hidden mr-4">
              <img 
                src={product.image || "/api/placeholder/64/64"} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Product Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{product.name}</h4>
                <span>{product.price}</span>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center border rounded-full overflow-hidden">
                  <button 
                    onClick={decrementQuantity}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    -
                  </button>
                  <span className="px-3 py-1">{quantity}</span>
                  <button 
                    onClick={incrementQuantity}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleRemove}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cart Summary */}
      <div className="mt-auto">
        <div className="flex justify-between items-center mb-6 font-medium">
          <span>SUBTOTAL</span>
          <span>Rs.{subtotal}</span>
        </div>
        
        <button 
          className="w-full py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 text-center"
        >
          Checkout
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white w-full sm:w-2/3 md:w-1/2 lg:w-2/5 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full p-6 flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Render content based on sidebar type */}
        {sidebarType === 'details' ? renderProductDetails() : renderCart()}
      </div>
    </div>
  );
}