import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';

const CheckoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    house: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    type: 'Home'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Add class to prevent touch scrolling on mobile
      document.body.classList.add('modal-active');
    } else {
      // Restore scroll position when modal closes
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Remove the class
      document.body.classList.remove('modal-active');
      
      // Restore scroll position
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    return () => {
      // Clean up when component unmounts
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('modal-active');
    };
  }, [isOpen]);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      
      // Pre-fill user information if available
      const userData = JSON.parse(user);
      if (userData) {
        setDeliveryAddress(prev => ({
          ...prev,
          fullName: userData.name || prev.fullName,
          phone: userData.phone || prev.phone
        }));
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['fullName', 'phone', 'pincode', 'house', 'area', 'city', 'state'];
    
    requiredFields.forEach(field => {
      if (!deliveryAddress[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });
    
    // Phone validation
    if (deliveryAddress.phone && !/^\d{10}$/.test(deliveryAddress.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Pincode validation
    if (deliveryAddress.pincode && !/^\d{6}$/.test(deliveryAddress.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Save current path to redirect back after login
      localStorage.setItem('redirectAfterLogin', location.pathname);
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare order data
      const orderData = {
        user: JSON.parse(localStorage.getItem('user'))._id,
        items: cartItems.map(item => ({
          productId: item.product._id,
          productName: item.product.productName || item.product.name,
          unit: item.product.priceVariants[item.selectedVariantIndex].unit,
          price: parseInt(item.product.priceVariants[item.selectedVariantIndex].price.toString().replace(/[^\d]/g, '')),
          quantity: item.quantity,
          productType: item.product.productType || 'Product'
        })),
        deliveryAddress,
        totalAmount: getCartTotal(),
        paymentMethod: 'COD' // Default to COD for now
      };
      
      // Call your API to create order
      const response = await fetch('http://localhost:8075/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear cart after successful order
        clearCart();
        
        // Show success message and close modal
        alert('Order placed successfully!');
        onClose();
      } else {
        alert(`Failed to place order: ${data.message}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative flex items-center justify-center w-full h-full p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Checkout</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            {!isAuthenticated ? (
              <div className="text-center py-6">
                <p className="mb-4 text-gray-700">Please log in to continue with checkout</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-green-700 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckout}>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left column - Order Summary */}
                  <div className="md:w-1/2">
                    <h3 className="font-medium text-gray-700 mb-2">Order Summary</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {cartItems.map((item, index) => (
                        <div key={`${item.product._id}-${item.selectedVariantIndex}`} className={`flex justify-between items-center py-1 ${index !== 0 ? 'border-t border-gray-200 mt-1' : ''}`}>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product.productName || item.product.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.product.priceVariants[item.selectedVariantIndex].unit} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm">
                            Rs.{item.product.priceVariants[item.selectedVariantIndex].price * item.quantity}
                          </p>
                        </div>
                      ))}
                      <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-medium">
                        <span>Total</span>
                        <span>Rs.{getCartTotal()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-700 mb-2">Payment Method</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={true}
                            readOnly
                            className="mr-2"
                          />
                          <span className="text-sm font-medium">Cash on Delivery</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column - Delivery Address */}
                  <div className="md:w-1/2">
                    <h3 className="font-medium text-gray-700 mb-2">Delivery Address</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name*</label>
                        <input
                          type="text"
                          name="fullName"
                          value={deliveryAddress.fullName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                      </div>
                      
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone*</label>
                        <input
                          type="tel"
                          name="phone"
                          value={deliveryAddress.phone}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                      
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Pincode*</label>
                        <input
                          type="text"
                          name="pincode"
                          value={deliveryAddress.pincode}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">House/Flat No.*</label>
                        <input
                          type="text"
                          name="house"
                          value={deliveryAddress.house}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.house ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.house && <p className="text-red-500 text-xs mt-1">{errors.house}</p>}
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Area/Street*</label>
                        <input
                          type="text"
                          name="area"
                          value={deliveryAddress.area}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.area ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Landmark</label>
                        <input
                          type="text"
                          name="landmark"
                          value={deliveryAddress.landmark}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">City*</label>
                        <input
                          type="text"
                          name="city"
                          value={deliveryAddress.city}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>
                      
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">State*</label>
                        <input
                          type="text"
                          name="state"
                          value={deliveryAddress.state}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Address Type</label>
                        <div className="flex gap-3">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="type"
                              value="Home"
                              checked={deliveryAddress.type === 'Home'}
                              onChange={handleInputChange}
                              className="mr-1"
                            />
                            <span className="text-sm">Home</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="type"
                              value="Work"
                              checked={deliveryAddress.type === 'Work'}
                              onChange={handleInputChange}
                              className="mr-1"
                            />
                            <span className="text-sm">Work</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-green-700 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;