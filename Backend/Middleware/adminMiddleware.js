const adminMiddleware = (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only'
    });
  }
  
  next();
};

export default adminMiddleware;