import React, { createContext, useContext, useState, useEffect } from 'react';

// Create both contexts
const CartContext = createContext();
const UserContext = createContext();

// Custom hooks to use the contexts
export function useCart() {
  return useContext(CartContext);
}

export function useUser() {
  return useContext(UserContext);
}

export function AppProvider({ children }) {
  // Cart state
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user data with proper error handling
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Check if token exists before making request
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return null;
      }
      
      const response = await fetch('http://localhost:8090/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          throw new Error('Authentication failed - please log in again');
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      
      // If user has a cart in their profile, use that
      if (userData.cart && userData.cart.length > 0) {
        setCartItems(userData.cart);
      }
      
      return userData;
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      console.error('Error fetching user data:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8090/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token and set authenticated state
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthenticated(true);
      setUser(data.user);
      
      // Fetch user data after successful login
      await fetchUserData();
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear user state
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear localStorage items related to authentication
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cart state
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // Update user data
  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('http://localhost:8090/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
    
    // If user is authenticated, save cart to database
    if (isAuthenticated && user) {
      saveCartToDatabase();
    }
  }, [cartItems, isAuthenticated, user]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const saveCartToDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;
      
      await fetch(`http://localhost:8090/api/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cart: cartItems }),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error saving cart to database:', error);
    }
  };

  // Cart functions
  const addToCart = (product, quantity, selectedVariantIndex) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => 
        item.product._id === product._id && 
        item.selectedVariantIndex === selectedVariantIndex
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity, selectedVariantIndex }];
      }
    });
    
    return Promise.resolve(true);
  };
  
  const updateCartItemQuantity = (productId, variantIndex, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantities less than 1
    
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
      if (!item.product.priceVariants || 
          !item.product.priceVariants[item.selectedVariantIndex]) {
        return total;
      }
      
      const priceVariant = item.product.priceVariants[item.selectedVariantIndex];
      const priceString = priceVariant.price.toString().replace(/[^\d]/g, '') || "0";
      const price = parseInt(priceString, 10);
      return total + (price * item.quantity);
    }, 0);
  };
  
  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // Cart context value
  const cartValue = {
    cartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
    clearCart
  };

  // User context value
  const userValue = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    fetchUserData,
    updateUser
  };
  
  return (
    <UserContext.Provider value={userValue}>
      <CartContext.Provider value={cartValue}>
        {children}
      </CartContext.Provider>
    </UserContext.Provider>
  );
}

// For backward compatibility
export function CartProvider({ children }) {
  return <AppProvider>{children}</AppProvider>;
}
