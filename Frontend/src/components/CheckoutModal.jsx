import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';

// Set app element for accessibility
Modal.setAppElement('#root');

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '900px',
    width: '90%',
    padding: '0',
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
    zIndex: 1000
  }
};

const CheckoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [step, setStep] = useState(1);
  
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      
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
    
    if (deliveryAddress.phone && !/^\d{10}$/.test(deliveryAddress.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (deliveryAddress.pincode && !/^\d{6}$/.test(deliveryAddress.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRazorpayPayment = async () => {
    try {
      const orderData = {
        amount: getCartTotal() * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      };
      
      const order = {
        id: `order_${Date.now()}`,
        amount: orderData.amount
      };
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        const options = {
          key: 'rzp_test_YOUR_KEY_HERE',
          amount: order.amount,
          currency: 'INR',
          name: 'Your Shop Name',
          description: 'Purchase from Your Shop',
          order_id: order.id,
          handler: function(response) {
            alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            placeOrder('ONLINE', response.razorpay_payment_id);
          },
          prefill: {
            name: deliveryAddress.fullName,
            email: 'customer@example.com',
            contact: deliveryAddress.phone
          },
          theme: {
            color: '#16a34a'
          },
          modal: {
            ondismiss: function() {
              console.log('Payment modal closed');
            }
          }
        };
        
        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      };
    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const placeOrder = async (paymentMethod, transactionId = null) => {
    setIsSubmitting(true);
    
    try {
      const orderData = {
        user: JSON.parse(localStorage.getItem('user'))._id,
        items: cartItems.map(item => ({
          productId: item.product._id,
          productName: item.product.productName || item.product.name,
          unit: item.product.priceVariants?.[item.selectedVariantIndex]?.unit || '',
          price: parseInt(
            (item.product.priceVariants?.[item.selectedVariantIndex]?.price || 0)
              .toString()
              .replace(/[^\d]/g, '')
          ),
          quantity: item.quantity,
          productType: item.product.productType || 'Product'
        })),
        deliveryAddress,
        totalAmount: getCartTotal(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        transactionId: transactionId
      };
      
      const response = await fetch('http://localhost:8090/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        clearCart();
        showSuccessMessage();
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

  const showSuccessMessage = () => {
    const successElement = document.createElement('div');
    successElement.className = 'fixed inset-0 flex items-center justify-center z-[9999]';
    successElement.innerHTML = `
      <div class="bg-white rounded-lg p-8 max-w-md shadow-2xl border-t-4 border-green-500 transform transition-all duration-300 ease-in-out">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Order Placed Successfully!</h2>
          <p class="text-gray-600 text-center mb-6">Your order has been placed and will be processed soon.</p>
          <button class="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
      <div class="fixed inset-0 bg-black/50 -z-10"></div>
    `;
    
    document.body.appendChild(successElement);
    
    const continueButton = successElement.querySelector('button');
    continueButton.addEventListener('click', () => {
      document.body.removeChild(successElement);
      onClose();
    });
    
    setTimeout(() => {
      if (document.body.contains(successElement)) {
        document.body.removeChild(successElement);
        onClose();
      }
    }, 5000);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', location.pathname);
      navigate('/login');
      return;
    }
    
    if (step === 1) {
      if (validateForm()) {
        setStep(2);
      }
      return;
    }
    
    if (paymentMethod === 'ONLINE') {
      handleRazorpayPayment();
    } else {
      placeOrder('COD');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Checkout Modal"
    >
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header with progress indicator - fixed at top */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-4 border-b border-green-700 z-10 rounded-t-lg text-white">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Checkout</h2>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-white text-green-600' : 'bg-green-400/30 text-white/70'} shadow-md`}>
                1
              </div>
              <div className={`h-1 w-12 mx-2 ${step >= 2 ? 'bg-white' : 'bg-green-400/30'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-white text-green-600' : 'bg-green-400/30 text-white/70'} shadow-md`}>
                2
              </div>
            </div>
            <div className="text-sm font-medium text-white/90">
              {step === 1 ? 'Delivery Information' : 'Payment & Review'}
            </div>
          </div>
        </div>
        
        <div 
          className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50" 
          style={{ 
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sign in to continue</h3>
              <p className="mb-6 text-gray-600">Please log in to your account to proceed with checkout</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors shadow-md"
              >
                Log In
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckout}>
              {step === 1 ? (
                <div>
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-3">
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <input
                            type="text"
                            name="fullName"
                            value={deliveryAddress.fullName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 text-sm border rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Full name*"
                          />
                          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                        </div>
                        
                        <div className="col-span-1">
                          <input
                            type="tel"
                            name="phone"
                            value={deliveryAddress.phone}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 text-sm border rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="mobile number*"
                          />
                          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        
                        <div className="col-span-1">
                          <input
                            type="text"
                            name="pincode"
                            value={deliveryAddress.pincode}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 text-sm border rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="6-digit pincode*"
                          />
                          {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                        </div>
                        
                        <div className="col-span-1">
                          <input
                            type="text"
                            name="house"
                            value={deliveryAddress.house}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 text-sm border rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.house ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="House/Flat No., Building name*"
                          />
                          {errors.house && <p className="text-red-500 text-xs mt-1">{errors.house}</p>}
                        </div>
                        
                        <div className="col-span-1">
                          <input
                            type="text"
                            name="area"
                            value={deliveryAddress.area}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 text-sm border rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.area ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Road name, Area, Colony*"
                          />
                          {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                        </div>
                        
                        <div className="col-span-2">
                          <input
                            type="text"
                            name="landmark"
                            value={deliveryAddress.landmark}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Nearby landmark (optional)"
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <input
                            type="text"
                            name="city"
                            value={deliveryAddress.city}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 text-sm border rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="City*"
                          />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>
                        
                        <div className="col-span-1">
                          <input
                            type="text"
                            name="state"
                            value={deliveryAddress.state}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 text-sm border rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="State*"
                          />
                          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                        </div>
                        
                        <div className="col-span-2">
                          <div className="text-xs text-gray-500 mb-1">Address Type</div>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="type"
                                value="Home"
                                checked={deliveryAddress.type === 'Home'}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Home</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="type"
                                value="Work"
                                checked={deliveryAddress.type === 'Work'}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Work</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Order Review</h3>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="space-y-5">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Address</h4>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                            <p className="font-medium">{deliveryAddress.fullName}</p>
                            <p className="text-gray-600">{deliveryAddress.house}, {deliveryAddress.area}</p>
                            <p className="text-gray-600">{deliveryAddress.landmark && `${deliveryAddress.landmark}, `}{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}</p>
                            <p className="text-gray-600">Phone: {deliveryAddress.phone}</p>
                            <div className="mt-2 flex">
                              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                {deliveryAddress.type}
                              </span>
                              <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="ml-auto text-xs text-green-600 hover:text-green-800"
                              >
                                Change
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h4>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="space-y-3">
                              <label className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="COD"
                                  checked={paymentMethod === 'COD'}
                                  onChange={() => setPaymentMethod('COD')}
                                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <div className="ml-3">
                                  <span className="text-sm font-medium text-gray-800">Cash on Delivery</span>
                                  <p className="text-xs text-gray-500 mt-0.5">Pay when your order is delivered</p>
                                </div>
                              </label>
                              
                              <label className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="ONLINE"
                                  checked={paymentMethod === 'ONLINE'}
                                  onChange={() => setPaymentMethod('ONLINE')}
                                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <div className="ml-3 flex-1">
                                  <span className="text-sm font-medium text-gray-800">Pay Online</span>
                                  <p className="text-xs text-gray-500 mt-0.5">Pay securely via Razorpay</p>
                                  <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-5 mt-1" />
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Order Summary</h4>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="max-h-[150px] overflow-y-auto pr-2 mb-3" style={{ 
                              overflowY: 'auto',
                              WebkitOverflowScrolling: 'touch'
                            }}>
                              {cartItems.map((item, index) => (
                                <div key={`${item.product._id}-${item.selectedVariantIndex}`} className={`flex items-center py-2 ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                                  <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex-shrink-0 flex items-center justify-center mr-3">
                                    <img 
                                      src={item.product.image || "/assets/testimg.png"} 
                                      alt={item.product.name} 
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{item.product.productName || item.product.name}</p>
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs text-gray-500">
                                        {item.product.priceVariants?.[item.selectedVariantIndex]?.unit || ''} × {item.quantity}
                                      </p>
                                      <p className="text-sm font-medium">
                                        Rs.{(item.product.priceVariants?.[item.selectedVariantIndex]?.price || 0) * item.quantity}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-gray-200 pt-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span>Rs.{getCartTotal()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span>Free</span>
                              </div>
                              <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
                                <span>Total</span>
                                <span className="text-green-700">Rs.{getCartTotal()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 py-2">
                    <div className="flex items-center text-gray-500 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secure Checkout
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      100% Safe & Secure
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-between">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full hover:from-green-500 hover:to-green-600 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${step === 1 ? 'ml-auto' : ''} transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    step === 1 ? 'Continue to Payment' : paymentMethod === 'ONLINE' ? 'Pay Now' : 'Place Order'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #16a34a80;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }
        
        @media (min-width: 768px) {
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: #16a34a80;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #16a34a;
          }
        }
      `}</style>
    </Modal>
  );
};

export default CheckoutModal;
