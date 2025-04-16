import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Login() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Form validation
    if (!isSignIn && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (isSignIn) {
        setSuccess("Successfully signed in!");
        // Here you would typically redirect or set auth state
      } else {
        setSuccess("Account created successfully!");
        // Here you would typically redirect or set auth state
      }
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // Add your Google login logic here
    console.log("Logging in with Google");
    // Typically this would redirect to Google OAuth or open a popup
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
          
          <div className="flex-1 flex items-center justify-center p-1 md:p-2 overflow-hidden">
            <div className="w-full max-w-sm">
              <div className= "bg-white/10 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/20">
                <div className="flex justify-center mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {isSignIn ? 'Sign In' : 'Create Account'}
                  </h1>
                </div>
                
                <div className="flex mb-2">
                  <button
                    className={`flex-1 py-1 text-x text-center rounded-l-full transition-all duration-300 ${
                      isSignIn 
                        ? 'bg-white text-green-700 font-medium'
                        : 'bg-transparent text-white border-y border-l border-white hover:bg-white/20'
                    }`}
                    onClick={() => setIsSignIn(true)}
                  >
                    Sign In
                  </button>
                  <button
                    className={`flex-1 py-1 text-sm text-center rounded-r-full transition-all duration-300 ${
                      !isSignIn 
                        ? 'bg-white text-green-700 font-medium'
                        : 'bg-transparent text-white border-y border-r border-white hover:bg-white/20'
                    }`}
                    onClick={() => setIsSignIn(false)}
                  >
                    Sign Up
                  </button>
                </div>
                
                {error && (
                  <div className="mb-1 p-1 bg-red-100/30 backdrop-blur-sm border border-red-300/30 rounded-lg text-white text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-1 p-1 bg-green-100/30 backdrop-blur-sm border border-green-300/30 rounded-lg text-white text-sm">
                    {success}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    {!isSignIn && (
                      <div>
                        <label htmlFor="name" className="block text-white text-xs mb-0">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all duration-300 text-xs"
                          placeholder="Enter your name"
                          required={!isSignIn}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="email" className="block text-white text-sm mb-0">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all duration-300 text-sm"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-white text-sm mb-0">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all duration-300 text-sm"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white text-xs"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    
                    {!isSignIn && (
                      <div>
                        <label htmlFor="confirmPassword" className="block text-white text-sm mb-0">Confirm Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all duration-300 text-sm"
                          placeholder="Confirm your password"
                          required={!isSignIn}
                        />
                      </div>
                    )}
                  </div>
                  
                  {isSignIn && (
                    <div className="flex justify-end mt-1 mb-1">
                      <Link to="/forgot-password" className="text-white/80 hover:text-white text-sm">
                        Forgot Password?
                      </Link>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full py-1 mt-1 mb-1 bg-white text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-all duration-300 flex justify-center items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin h-3 w-3 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      isSignIn ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </form>
                
                <div className="text-center my-1">
                  <button
                    onClick={toggleForm}
                    className="text-white/80 hover:text-white text-sm"
                  >
                    {isSignIn 
                      ? "Don't have an account? Sign Up" 
                      : "Already have an account? Sign In"}
                  </button>
                </div>
                
                {/* Simplified social login section with only Google */}
                <div className="mt-1 pt-1 border-t border-white/20">
                  <p className="text-center text-white/70 text-sm mb-1">Or continue with</p>
                  <div className="flex justify-center">
                    <button 
                      onClick={handleGoogleLogin}
                      className="flex items-center justify-center w-full py-1 px-4 rounded-full bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 text-sm text-white"
                    >
                      <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.177-2.664-6.735-2.664-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.67-0.069-1.325-0.189-1.961h-9.811z"/>
                      </svg>
                      Login with Google
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}