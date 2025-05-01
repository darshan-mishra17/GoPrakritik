import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
const UserContext = createContext();

export function useCart() {
  return useContext(CartContext);
}
export function useUser() {
  return useContext(UserContext);
}

export function AppProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch cart from database and map product fields for UI
  const fetchCartFromDatabase = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !userId) return;
      const cartResponse = await fetch(`http://localhost:8090/api/user/${userId}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        if (cartData.success && cartData.cart && cartData.cart.length > 0) {
          // Map product fields to what your UI expects
          const transformedCart = cartData.cart.map(item => {
            const prod = item.productId;
            return {
              product: {
                _id: prod._id,
                name: prod.productName, // map to UI field
                image: prod.image || '', // fallback if missing
                priceVariants: prod.priceVariants,
                description: prod.description,
                organicProcessingMethod: prod.organicProcessingMethod,
                traditionalMethods: prod.traditionalMethods,
                benefits: prod.benefits,
                usage: prod.usage,
              },
              quantity: item.quantity,
              selectedVariantIndex: item.selectedVariantIndex
            };
          });
          setCartItems(transformedCart);
          localStorage.setItem('cart', JSON.stringify(transformedCart));
          return transformedCart;
        } else {
          setCartItems([]);
          localStorage.removeItem('cart');
        }
      }
    } catch (err) {
      console.error('Error fetching cart from database:', err);
    }
    return [];
  };

  // Fetch user and cart from DB on login
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) {
        setIsAuthenticated(false);
        setLoading(false);
        return null;
      }
      const userObj = JSON.parse(userStr);

      const response = await fetch(`http://localhost:8090/api/user/${userObj._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          throw new Error('Authentication failed - please log in again');
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      // Fetch cart from DB
      if (userData._id) {
        await fetchCartFromDatabase(userData._id);
      }
      return userData;
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Login function (email/password)
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setIsAuthenticated(true);
      setUser(data.data);
      // Fetch user cart after successful login
      if (data.data && data.data._id) {
        await fetchCartFromDatabase(data.data._id);
      }
      return true;
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const googleLogin = async (credential) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/user/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setIsAuthenticated(true);
      setUser(data.data);
      // Fetch user cart after successful Google login
      if (data.data && data.data._id) {
        await fetchCartFromDatabase(data.data._id);
      }
      return true;
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (isAuthenticated && user && cartItems.length > 0) {
        await saveCartToDatabase();
      }
    } catch (error) {
      console.error('Error saving cart on logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  // Save cart items one by one (not as an array)
  const saveCartToDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;
      // Save each cart item individually
      for (const item of cartItems) {
        const response = await fetch(`http://localhost:8090/api/user/${user._id}/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: item.product._id,
            quantity: item.quantity,
            selectedVariantIndex: item.selectedVariantIndex
          }),
          credentials: 'include'
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response from server:', errorData);
          throw new Error(errorData.message || 'Failed to save cart');
        }
      }
    } catch (error) {
      console.error('Error saving cart to database:', error);
    }
  };

  // Save cart to localStorage and backend when it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
    if (isAuthenticated && user && user._id) {
      const debounceSave = setTimeout(() => {
        saveCartToDatabase();
      }, 1000);
      return () => clearTimeout(debounceSave);
    }
  }, [cartItems, isAuthenticated, user]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUserData();
    else setLoading(false);
  }, []);

  // Cart functions
  const addToCart = async (product, quantity, selectedVariantIndex) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item =>
        item.product._id === product._id &&
        item.selectedVariantIndex === selectedVariantIndex
      );
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        return [...prevItems, { product, quantity, selectedVariantIndex }];
      }
    });
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8090/api/user/${user._id}/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          selectedVariantIndex
        }),
        credentials: 'include'
      });
    }
  };

  const updateCartItemQuantity = async (productId, variantIndex, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.product._id === productId && item.selectedVariantIndex === variantIndex)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8090/api/user/${user._id}/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: newQuantity,
          selectedVariantIndex: variantIndex
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        // Optionally: revert local change or show error
        const errorData = await response.json();
        console.error('Update cart error:', errorData.message);
      }
    }
  };

  const removeFromCart = async (productId, variantIndex) => {
    setCartItems(prevItems =>
      prevItems.filter(item =>
        !(item.product._id === productId && item.selectedVariantIndex === variantIndex)
      )
    );
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8090/api/user/${user._id}/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          selectedVariantIndex: variantIndex
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        // Optionally: revert local change or show error
        const errorData = await response.json();
        console.error('Remove cart error:', errorData.message);
      }
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item.product.priceVariants || !item.product.priceVariants[item.selectedVariantIndex]) {
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

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8090/api/user/${user._id}/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify([]),
        credentials: 'include'
      });
    }
  };

  const cartValue = {
    cartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
    clearCart,
    fetchCartFromDatabase
  };

  const userValue = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    googleLogin,
    logout,
    fetchUserData
  };

  return (
    <UserContext.Provider value={userValue}>
      <CartContext.Provider value={cartValue}>
        {children}
      </CartContext.Provider>
    </UserContext.Provider>
  );
}

export function CartProvider({ children }) {
  return <AppProvider>{children}</AppProvider>;
}
