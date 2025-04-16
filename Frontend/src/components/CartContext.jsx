import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
        setCartItems([]);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (product, quantity, selectedVariantIndex) => {
    setCartItems(prevItems => {
      // Check if this product variant is already in the cart
      const existingItemIndex = prevItems.findIndex(item => 
        item.product._id === product._id &&
        item.selectedVariantIndex === selectedVariantIndex
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity, selectedVariantIndex }];
      }
    });
  };
  
  const updateCartItemQuantity = (productId, variantIndex, newQuantity) => {
    setCartItems(prevItems => 
      prevItems.map(item =>
        (item.product._id === productId && item.selectedVariantIndex === variantIndex) 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };
  
  const removeFromCart = (productId, variantIndex) => {
    setCartItems(prevItems => 
      prevItems.filter(item =>
        !(item.product._id === productId && item.selectedVariantIndex === variantIndex)
      )
    );
  };
  
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const priceVariant = item.product.priceVariants[item.selectedVariantIndex];
      const priceString = priceVariant?.price.toString().replace(/[^\d]/g, '') || "0";
      const price = parseInt(priceString, 10);
      return total + (price * item.quantity);
    }, 0);
  };
  
  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  const value = {
    cartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
    clearCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}