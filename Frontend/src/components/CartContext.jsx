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
        try {
          const cartResponse = await fetch(`http://localhost:8090/api/user/${userData._id}/cart`, {
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
              const transformedCart = await Promise.all(cartData.cart.map(async (item) => {
                const productResponse = await fetch(`http://localhost:8090/api/products/${item.productId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  credentials: 'include'
                });
                if (!productResponse.ok) return null;
                const product = await productResponse.json();
                return {
                  product: product.data,
                  quantity: item.quantity,
                  selectedVariantIndex: item.selectedVariantIndex
                };
              }));
              setCartItems(transformedCart.filter(item => item !== null));
            } else {
              setCartItems([]);
            }
          }
        } catch (cartError) {
          console.error('Error fetching cart:', cartError);
        }
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

  // Login function
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
      await fetchUserData();
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

  // Google login function (for context)
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
      await fetchUserData();
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

  // Logout function with cart saving
  const logout = async () => {
    try {
      if (isAuthenticated && user && cartItems.length > 0) {
        const token = localStorage.getItem('token');
        const transformedCart = cartItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          selectedVariantIndex: item.selectedVariantIndex
        }));
        await fetch(`http://localhost:8090/api/user/${user._id}/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(transformedCart),
          credentials: 'include'
        });
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

  // Save cart to localStorage and backend when it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
    if (isAuthenticated && user) saveCartToDatabase();
    // eslint-disable-next-line
  }, [cartItems, isAuthenticated, user]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUserData();
    else setLoading(false);
    // eslint-disable-next-line
  }, []);

  const saveCartToDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;
      const transformedCart = cartItems.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        selectedVariantIndex: item.selectedVariantIndex
      }));
      await fetch(`http://localhost:8090/api/user/${user._id}/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transformedCart),
        credentials: 'include'
      });
      
    } catch (error) {
      console.error('Error saving cart to database:', error);
    }
  };

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
      await fetch(`http://localhost:8090/api/user/${user._id}/cart`, {
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
      await fetch(`http://localhost:8090/api/user/${user._id}/cart`, {
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
    clearCart
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
