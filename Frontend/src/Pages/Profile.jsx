import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Clock, ShoppingBag, MapPin, Phone, Mail, Edit, ChevronDown, ChevronUp, Home as HomeIcon, Briefcase, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Fetch user orders
    fetchOrders(JSON.parse(userData)._id, token);
  }, [navigate]);

  const fetchOrders = async (userId, token) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-500 text-white';
      case 'Shipped':
        return 'bg-blue-500 text-white';
      case 'Processing':
        return 'bg-yellow-500 text-white';
      case 'Cancelled':
        return 'bg-red-500 text-white';
      case 'Paid':
        return 'bg-green-500 text-white';
      case 'Pending':
        return 'bg-yellow-500 text-white';
      case 'Failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/assets/bg.png")',
          zIndex: -1,
        }}
      />
      
      <div className="flex items-center justify-center w-full h-full">
        <div className="backdrop-blur-sm bg-green-700/90 rounded-3xl md:rounded-3xl shadow-xl w-full h-full max-w-[95%] sm:max-w-[90%] max-h-[95vh] sm:max-h-[90vh] flex flex-col py-2 md:py-4">
          <Navbar />
          
          <div className="flex-1 overflow-auto px-4 md:px-8 py-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
              </div>
            ) : (
              <div className="h-full">
                {/* Profile Header - Smaller Design */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="text-center md:text-left">
                    <h1 className="text-white text-base md:text-base font-bold mb-0.5">
                      {user?.name}
                    </h1>
                    <p className="text-white/80 text-sm mb-2">
                      {user?.email}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      <button
                        onClick={handleLogout}
                        className="group relative overflow-hidden bg-transparent text-white px-4 py-1.5 rounded-full font-semibold text-sm transition duration-500 inline-flex items-center justify-center"
                      >
                        <span className="absolute inset-0 border-2 border-white opacity-100 rounded-full transform scale-100 group-hover:scale-110 transition-transform duration-500"></span>
                        <span className="absolute inset-0 bg-red-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-150 ease-out rounded-full"></span>
                        <LogOut className="w-4 h-4 mr-2 relative z-10" />
                        <span className="relative z-10 transition duration-300 group-hover:text-white">
                          Sign Out
                        </span>
                      </button>
                      
                      <Link 
                        to="/shop" 
                        className="group relative overflow-hidden bg-transparent text-white px-4 py-1.5 rounded-full font-semibold text-sm transition duration-500 inline-flex items-center justify-center"
                      >
                        <span className="absolute inset-0 border-2 border-white opacity-100 rounded-full transform scale-100 group-hover:scale-110 transition-transform duration-500"></span>
                        <span className="absolute inset-0 bg-green-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-150 ease-out rounded-full"></span>
                        <ShoppingBag className="w-4 h-4 mr-2 relative z-10" />
                        <span className="relative z-10 transition duration-300 group-hover:text-white">
                          Continue Shopping
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="inline-flex rounded-full bg-white/10 p-1">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`px-6 py-2 rounded-full text-white font-medium transition-all duration-200 ${
                        activeTab === 'profile'
                          ? 'bg-green-600 shadow-lg'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`px-6 py-2 rounded-full text-white font-medium transition-all duration-200 ${
                        activeTab === 'orders'
                          ? 'bg-green-600 shadow-lg'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Orders
                      </span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-auto" style={{ maxHeight: 'calc(100% - 220px)' }}>
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div className="bg-white/10 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-white/20">
                          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-green-400" />
                            Personal Information
                          </h3>
                          <button className="text-white/80 hover:text-white flex items-center gap-1 transition-colors">
                            <Edit className="w-4 h-4" />
                            <span className="text-sm">Edit</span>
                          </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-white/60">Full Name</h4>
                              <p className="mt-1 text-lg text-white">{user?.name}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white/60">Email Address</h4>
                              <p className="mt-1 text-lg text-white flex items-center gap-2">
                                <Mail className="w-4 h-4 text-green-400" />
                                {user?.email}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white/60">Phone Number</h4>
                              <p className="mt-1 text-lg text-white flex items-center gap-2">
                                <Phone className="w-4 h-4 text-green-400" />
                                {user?.phone || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-white/20">
                          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-400" />
                            Delivery Addresses
                          </h3>
                          <button className="text-white/80 hover:text-white flex items-center gap-1 transition-colors">
                            <Edit className="w-4 h-4" />
                            <span className="text-sm">Manage</span>
                          </button>
                        </div>
                        <div className="px-6 py-4">
                          {user?.addresses && user.addresses.length > 0 ? (
                            <div className="space-y-4">
                              {user.addresses.map((address, index) => (
                                <div key={index} className="border border-white/20 rounded-xl p-4 bg-white/5">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        address.type === 'Home' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                                      }`}>
                                        {address.type === 'Home' ? (
                                          <HomeIcon className="w-3 h-3 mr-1" />
                                        ) : (
                                          <Briefcase className="w-3 h-3 mr-1" />
                                        )}
                                        {address.type}
                                      </span>
                                      <h4 className="text-lg font-medium text-white">{address.fullName}</h4>
                                    </div>
                                    <div className="flex gap-2">
                                      <button className="text-sm text-green-400 hover:text-green-300">Edit</button>
                                      <button className="text-sm text-red-400 hover:text-red-300">Delete</button>
                                    </div>
                                  </div>
                                  <p className="mt-2 text-white/80">
                                    {address.house}, {address.area}
                                    {address.landmark && `, Near ${address.landmark}`}
                                  </p>
                                  <p className="text-white/80">
                                    {address.city}, {address.state} - {address.pincode}
                                  </p>
                                  <p className="text-white/80 mt-1">
                                    <Phone className="w-3 h-3 inline mr-1" />
                                    {address.phone}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <MapPin className="mx-auto h-12 w-12 text-white/40" />
                              <h3 className="mt-2 text-lg font-medium text-white">No addresses saved</h3>
                              <p className="mt-1 text-white/60">Add an address to make checkout faster.</p>
                              <div className="mt-6">
                                <button
                                  type="button"
                                  className="group relative overflow-hidden bg-transparent text-white px-6 py-2 rounded-full font-semibold transition duration-500 inline-flex items-center justify-center"
                                >
                                  <span className="absolute inset-0 border-2 border-white opacity-100 rounded-full transform scale-100 group-hover:scale-110 transition-transform duration-500"></span>
                                  <span className="absolute inset-0 bg-green-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-150 ease-out rounded-full"></span>
                                  <MapPin className="w-5 h-5 mr-2 relative z-10" />
                                  <span className="relative z-10 transition duration-300 group-hover:text-white">
                                    Add New Address
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                        <ShoppingBag className="w-6 h-6 text-green-400" />
                        Your Orders
                      </h2>
                      
                      {orders.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/20">
                          <ShoppingBag className="mx-auto h-16 w-16 text-white/30" />
                          <h3 className="mt-4 text-xl font-medium text-white">No orders yet</h3>
                          <p className="mt-2 text-white/60 max-w-md mx-auto">Start shopping to see your orders here.</p>
                          <div className="mt-8">
                            <Link
                              to="/shop"
                              className="group relative overflow-hidden bg-transparent text-white px-6 py-2 rounded-full font-semibold transition duration-500 inline-flex items-center justify-center"
                            >
                              <span className="absolute inset-0 border-2 border-white opacity-100 rounded-full transform scale-100 group-hover:scale-110 transition-transform duration-500"></span>
                              <span className="absolute inset-0 bg-green-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-150 ease-out rounded-full"></span>
                              <ShoppingBag className="w-5 h-5 mr-2 relative z-10" />
                              <span className="relative z-10 transition duration-300 group-hover:text-white">
                                Browse Products
                              </span>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order._id} className="bg-white/5 border border-white/20 rounded-xl overflow-hidden">
                              <div className="px-6 py-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <p className="text-lg font-medium text-green-400">
                                      Order #{order._id.substring(order._id.length - 8)}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-white/60" />
                                      <p className="text-sm text-white/80">
                                        {formatDate(order.orderDate)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(order.deliveryStatus)}`}>
                                      {order.deliveryStatus}
                                    </span>
                                    <button
                                      onClick={() => toggleOrderDetails(order._id)}
                                      className="text-white/60 hover:text-white transition-colors"
                                    >
                                      {expandedOrder === order._id ? (
                                        <ChevronUp className="w-6 h-6" />
                                      ) : (
                                        <ChevronDown className="w-6 h-6" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-white/60" />
                                    <p className="text-white/80">
                                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.paymentStatus)}`}>
                                      {order.paymentStatus}
                                    </span>
                                    <span className="text-sm text-white/80">{order.paymentMethod}</span>
                                    <p className="text-xl font-semibold text-white">₹{order.totalAmount.toFixed(2)}</p>
                                  </div>
                                </div>

                                {expandedOrder === order._id && (
                                  <div className="mt-6 border-t border-white/20 pt-6">
                                    <h4 className="text-lg font-medium text-white mb-4">Order Items</h4>
                                    <div className="space-y-4">
                                      {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                          <div className="flex items-center">
                                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-white/10 flex items-center justify-center">
                                              <ShoppingBag className="h-6 w-6 text-white/60" />
                                            </div>
                                            <div className="ml-4">
                                              <div className="text-white font-medium">{item.productName}</div>
                                              <div className="text-sm text-white/60">
                                                {item.unit} × {item.quantity}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-lg font-medium text-white">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <div className="mt-6 border-t border-white/20 pt-4">
                                      <div className="flex justify-between text-lg font-medium">
                                        <span className="text-white/80">Total</span>
                                        <span className="text-green-400">₹{order.totalAmount.toFixed(2)}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-6 border-t border-white/20 pt-4">
                                      <h4 className="text-lg font-medium text-white mb-4">Delivery Address</h4>
                                      <div className="bg-white/5 p-4 rounded-lg text-white/80">
                                        <p className="font-medium text-white">{order.deliveryAddress.fullName}</p>
                                        <p>{order.deliveryAddress.house}, {order.deliveryAddress.area}</p>
                                        {order.deliveryAddress.landmark && <p>Landmark: {order.deliveryAddress.landmark}</p>}
                                        <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                                        <p className="mt-2 flex items-center">
                                          <Phone className="w-4 h-4 mr-2 text-white/60" />
                                          {order.deliveryAddress.phone}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {order.deliveryStatus !== 'Cancelled' && order.deliveryStatus !== 'Delivered' && (
                                      <div className="mt-6 flex justify-end">
                                        <button
                                          className="group relative overflow-hidden bg-transparent text-white px-6 py-2 rounded-full font-semibold transition duration-500 inline-flex items-center justify-center"
                                        >
                                          <span className="absolute inset-0 border-2 border-red-500 opacity-100 rounded-full transform scale-100 group-hover:scale-110 transition-transform duration-500"></span>
                                          <span className="absolute inset-0 bg-red-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-150 ease-out rounded-full"></span>
                                          <span className="relative z-10 transition duration-300 group-hover:text-white">
                                            Cancel Order
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
