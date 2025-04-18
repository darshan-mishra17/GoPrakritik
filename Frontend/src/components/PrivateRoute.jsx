// Create a new file called PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token') && localStorage.getItem('user');

  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    
    // Redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
