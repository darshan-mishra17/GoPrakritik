import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from '../components/Navbar';

export default function Login() {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (user && user._id) {
        navigate(`/shop/${user._id}`);
      } else {
        navigate('/shop');
      }
    }
  }, [navigate]);

  // Auto-dismiss the banner after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setError(null);
    setSuccess(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Validation
      if (!isSignIn && formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        setLoading(false);
        return;
      }

      // API endpoints based on action
      const endpoint = isSignIn
        ? 'http://localhost:8090/api/user/login'
        : 'http://localhost:8090/api/user/register';

      // Prepare request data
      const requestData = isSignIn
        ? {
          email: formData.email,
          password: formData.password
        }
        : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        };

      // Make API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Handle successful response
      setSuccess(isSignIn ? "Successfully signed in!" : "Account created successfully!");

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Store user data
      if (data.data) {
        localStorage.setItem('user', JSON.stringify(data.data));
      }

      // Check if there's a redirect path saved
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      
      // Redirect to user-specific shop after a short delay
      setTimeout(() => {
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else if (data.data && data.data._id) {
          navigate(`/shop/${data.data._id}`);
        } else {
          navigate('/shop');
        }
      }, 1500);
    } catch (err) {
      console.error('Error during authentication:', err);
      setError(err.message || 'Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google login success handler
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    
    try {
      // Send the ID token to your backend
      const response = await fetch('http://localhost:8090/api/user/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          credential: credentialResponse.credential 
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      // Handle successful response
      setSuccess("Successfully signed in with Google!");

      // Store token and user data
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      if (data.data) {
        localStorage.setItem('user', JSON.stringify(data.data));
      }

      // Check if there's a redirect path saved
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      
      // Redirect after a short delay
      setTimeout(() => {
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else if (data.data && data.data._id) {
          navigate(`/shop/${data.data._id}`);
        } else {
          navigate('/shop');
        }
      }, 1500);
    } catch (err) {
      console.error('Error during Google authentication:', err);
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  // Google login error handler
  const handleGoogleLoginError = (error) => {
    console.error('Google Sign-In Error:', error);
    setError('Google sign-in was unsuccessful. Please try again.');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("./assets/bg.png")',
          zIndex: -1,
        }}
      />

      <div className="flex items-center justify-center w-full h-full">
        <div className="backdrop-blur-sm bg-green-700/90 rounded-3xl md:rounded-3xl shadow-xl w-full h-full max-w-[95%] sm:max-w-[90%] max-h-[95vh] sm:max-h-[90vh] flex flex-col py-2 md:py-4">
          <Navbar />
          <div className="flex-1 flex items-center justify-center ">
            <div className="w-[20rem] md:w-[25rem] lg:w-[27rem] animate-fadeIn ">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 shadow-lg border border-white/20 ">
                <div className="flex justify-center mb-5">
                  <h1 className="text-xl font-bold text-white">
                    {isSignIn ? 'Welcome back' : 'Create account'}
                  </h1>
                </div>

                <div className="flex mb-5 rounded-full overflow-hidden bg-white/10 border border-white/20">
                  <button
                    className={`flex-1 py-2 text-center transition-all duration-300 ${isSignIn
                        ? 'bg-white text-green-700 font-medium'
                        : 'bg-transparent text-white hover:bg-white/10'
                      }`}
                    onClick={() => setIsSignIn(true)}
                  >
                    Sign In
                  </button>
                  <button
                    className={`flex-1 py-2 text-center transition-all duration-300 ${!isSignIn
                        ? 'bg-white text-green-700 font-medium'
                        : 'bg-transparent text-white hover:bg-white/10'
                      }`}
                    onClick={() => setIsSignIn(false)}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {!isSignIn && (
                    <div className="animate-fadeIn">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 text-sm"
                        placeholder="Full name"
                        required={!isSignIn}
                      />
                    </div>
                  )}

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 text-sm"
                      placeholder="Email address"
                      required
                    />
                  </div>

                  {!isSignIn && (
                    <div className="animate-fadeIn">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 text-sm"
                        placeholder="Phone number"
                        required={!isSignIn}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 text-sm"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white text-xs"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {!isSignIn && (
                    <div className="animate-fadeIn">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 text-sm"
                        placeholder="Confirm password"
                        required={!isSignIn}
                      />
                    </div>
                  )}

                  {isSignIn && (
                    <div className="flex justify-end">
                      <Link to="/forgot-password" className="text-white/80 hover:text-white text-xs">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 mt-2 bg-white text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-all duration-300 flex justify-center items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      isSignIn ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <button
                    onClick={toggleForm}
                    className="text-white/80 hover:text-white text-xs"
                  >
                    {isSignIn
                      ? "Don't have an account? Sign Up"
                      : "Already have an account? Sign In"}
                  </button>
                </div>

                <div className="mt-4 pt-3 bg-transparent">
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={handleGoogleLoginError}
                      useOneTap={false}
                      theme="filled_blue"
                      text="signin_with"
                      shape="pill"
                      width="250"
                      locale="en"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Error/Success Banner */}
      {(error || success) && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown mt-4">
          <div className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm flex items-center space-x-2 ${error ? 'bg-red-500/90 border border-red-400' : 'bg-green-500/90 border border-green-400'
            }`}>
            {error ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            <p className="text-white text-sm font-medium">{error || success}</p>
            <button
              onClick={() => error ? setError(null) : setSuccess(null)}
              className="text-white hover:text-gray-200 ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceOnce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-bounceOnce {
          animation: bounceOnce 0.6s ease;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
