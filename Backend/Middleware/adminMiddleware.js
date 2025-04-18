const adminMiddleware = (req, res, next) => {
  // Check if user exists and is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required'
    });
  }
  
  next();
};

export default adminMiddleware;
