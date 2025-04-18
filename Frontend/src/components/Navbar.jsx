import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Info, ShoppingCart, User, LogOut } from "lucide-react";
import { useCart } from './CartContext';

export default function Navbar({ openSidebar }) {
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  const isShopPage = location.pathname.includes('/shop');

  const handleCartClick = (e) => {
    e.preventDefault();
    
    if (isShopPage) {
      // On shop page, open the cart sidebar
      if (typeof openSidebar === 'function') {
        openSidebar(null, 'cart');
      }
    } else {
      // On other pages, navigate to user's shop page if logged in, or general shop if not
      if (user && user._id) {
        navigate(`/shop/${user._id}`);
      } else {
        navigate('/shop');
      }
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    setShowDropdown(false);
  };
  
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center">
        <Link to="/">
          <img
            className="h-8 sm:h-8 md:ml-4 lg:ml-4 md:h-16"
            src="/assets/logo.png"
            alt="Go Prakritik Logo"
          />
        </Link>
      </div>
      
      <div className="flex gap-6 md:gap-12 items-center mr-2 md:mr-6">
        <Link
          to={user && user._id ? `/shop/${user._id}` : "/shop"}
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
        
        {user ? (
          <div className="relative">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <span className="hidden md:block text-white text-sm font-medium">
                {user.name}
              </span>
            </div>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    Signed in as <span className="font-semibold">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="text-white text-lg relative group">
            <User className="w-6 h-6 md:hidden" />
            <span className="hidden md:block relative">
              Login
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full origin-right"></span>
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
