import React from 'react';
import { Link } from "react-router-dom";
import { ShoppingBag, Info, ShoppingCart } from "lucide-react";
import { useCart } from './CartContext';

export default function Navbar({ openSidebar }) {
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  
  const handleCartClick = (e) => {
    e.preventDefault();
    
    if (typeof openSidebar === 'function') {
      openSidebar(null, 'cart');
    }
  };
  
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center">
        <Link to="/">
          <img
            className="h-8 sm:h-8 md:ml-4 lg:ml-4 md:h-16"
            src="./assets/logo.png"
            alt="Go Prakritik Logo"
          />
        </Link>
      </div>
      
      <div className="flex gap-6 md:gap-12 items-center mr-2 md:mr-6">
        <Link
          to="/shop"
          className="text-white text-lg relative group"
        >
          <ShoppingBag className="w-6 h-6 md:hidden" />
          <span className="hidden md:block relative">
            Shop
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full origin-right"></span>
          </span>
        </Link>
        
        <Link
          to="/about"
          className="text-white text-lg relative group"
        >
          <Info className="w-6 h-6 md:hidden" />
          <span className="hidden md:block relative">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full origin-right"></span>
          </span>
        </Link>
        
        <div
          className="text-white text-lg relative group cursor-pointer"
          onClick={handleCartClick}
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 md:hidden" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="hidden md:block relative">
            Cart
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full origin-right"></span>
          </span>
        </div>
      </div>
    </div>
  );
}