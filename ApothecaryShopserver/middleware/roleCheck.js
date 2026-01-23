/**
 * Role-based access control middleware for the ApothecaryShop application
 * Used to restrict certain endpoints based on user roles
 */

// Role constants
const ROLES = {
  ADMIN: 'admin',
  INVENTORY_MANAGER: 'inventory_manager',
  PROCUREMENT_STAFF: 'procurement_staff',
  DISTRIBUTION_STAFF: 'distribution_staff',
  STAFF: 'staff' // Legacy role for backward compatibility
};

// Permission groups - legacy 'staff' role is treated as having general access (similar to distribution_staff)
const PERMISSIONS = {
  CAN_MANAGE_USERS: [ROLES.ADMIN],
  CAN_MANAGE_INVENTORY: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.STAFF],
  CAN_MANAGE_PROCUREMENT: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PROCUREMENT_STAFF, ROLES.STAFF],
  CAN_MANAGE_DISTRIBUTION: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.DISTRIBUTION_STAFF, ROLES.STAFF],
  CAN_VIEW_ALL: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PROCUREMENT_STAFF, ROLES.DISTRIBUTION_STAFF, ROLES.STAFF]
};

// Helper function to check if user has required role
const hasRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Admin only middleware - restricts access to administrators
exports.adminOnly = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!hasRole(req.user.role, PERMISSIONS.CAN_MANAGE_USERS)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

// Inventory access middleware - admin and inventory managers
exports.inventoryAccess = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!hasRole(req.user.role, PERMISSIONS.CAN_MANAGE_INVENTORY)) {
    return res.status(403).json({ message: 'Inventory management access required' });
  }

  next();
};

// Procurement access middleware - admin, inventory managers, and procurement staff
exports.procurementAccess = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!hasRole(req.user.role, PERMISSIONS.CAN_MANAGE_PROCUREMENT)) {
    return res.status(403).json({ message: 'Procurement access required' });
  }

  next();
};

// Distribution access middleware - admin, inventory managers, and distribution staff
exports.distributionAccess = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!hasRole(req.user.role, PERMISSIONS.CAN_MANAGE_DISTRIBUTION)) {
    return res.status(403).json({ message: 'Distribution access required' });
  }

  next();
};

// General staff access middleware - all authenticated roles
exports.staffAccess = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!hasRole(req.user.role, PERMISSIONS.CAN_VIEW_ALL)) {
    return res.status(403).json({ message: 'Staff access required' });
  }

  next();
};

// Flexible role check middleware - accepts array of allowed roles
exports.requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!hasRole(req.user.role, allowedRoles)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Export constants for use in other modules
exports.ROLES = ROLES;
exports.PERMISSIONS = PERMISSIONS;