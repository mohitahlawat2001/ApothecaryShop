/**
 * Role-based access control middleware for the ApothecaryShop application
 * Used to restrict certain endpoints based on user roles
 */

// Admin only middleware - restricts access to administrators
exports.adminOnly = (req, res, next) => {
    // Check if user is authenticated and has a role property
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
  
    // If user is an admin, proceed
    next();
  };
  
  // Staff access middleware - provides access to both admins and staff members
  exports.staffAccess = (req, res, next) => {
    // Check if user is authenticated and has a role property
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    // Check if user has admin or staff role
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Staff access required' });
    }
  
    // If user has appropriate role, proceed
    next();
  };