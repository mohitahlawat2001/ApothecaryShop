/**
 * Role definitions and permission utilities for the Apothecary Shop
 */

export const ROLES = {
  ADMIN: 'admin',
  INVENTORY_MANAGER: 'inventory_manager',
  PROCUREMENT_STAFF: 'procurement_staff',
  DISTRIBUTION_STAFF: 'distribution_staff',
  STAFF: 'staff' // Legacy role for backward compatibility
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
  [ROLES.PROCUREMENT_STAFF]: 'Procurement Staff',
  [ROLES.DISTRIBUTION_STAFF]: 'Distribution Staff',
  [ROLES.STAFF]: 'Staff (Legacy)'
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full system access including user management',
  [ROLES.INVENTORY_MANAGER]: 'Manage inventory, products, and stock movements',
  [ROLES.PROCUREMENT_STAFF]: 'Manage suppliers, purchase orders, and receipts',
  [ROLES.DISTRIBUTION_STAFF]: 'Manage product distribution and sales',
  [ROLES.STAFF]: 'General staff access (legacy role - consider migrating to a specific role)'
};

// Permission groups - which roles can access which features
// Legacy 'staff' role is included for backward compatibility with general access
export const PERMISSIONS = {
  // User management - Admin only
  CAN_MANAGE_USERS: [ROLES.ADMIN],
  
  // Inventory & Products
  CAN_VIEW_INVENTORY: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PROCUREMENT_STAFF, ROLES.DISTRIBUTION_STAFF, ROLES.STAFF],
  CAN_MANAGE_INVENTORY: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.STAFF],
  CAN_MANAGE_STOCK_MOVEMENTS: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.STAFF],
  
  // Procurement
  CAN_VIEW_PROCUREMENT: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PROCUREMENT_STAFF, ROLES.STAFF],
  CAN_MANAGE_PROCUREMENT: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PROCUREMENT_STAFF, ROLES.STAFF],
  CAN_MANAGE_SUPPLIERS: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PROCUREMENT_STAFF, ROLES.STAFF],
  
  // Distribution
  CAN_VIEW_DISTRIBUTION: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.DISTRIBUTION_STAFF, ROLES.STAFF],
  CAN_MANAGE_DISTRIBUTION: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.DISTRIBUTION_STAFF, ROLES.STAFF],
  
  // Dashboard & Analytics
  CAN_VIEW_DASHBOARD: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PROCUREMENT_STAFF, ROLES.DISTRIBUTION_STAFF, ROLES.STAFF],
  CAN_VIEW_AI_ANALYSIS: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER]
};

/**
 * Check if a user has permission for a specific action
 * @param {string} userRole - The user's role
 * @param {string[]} allowedRoles - Array of roles allowed for the action
 * @returns {boolean}
 */
export const hasPermission = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Check if user can access a specific feature
 * @param {string} userRole - The user's role
 * @param {string} permissionKey - Key from PERMISSIONS object
 * @returns {boolean}
 */
export const canAccess = (userRole, permissionKey) => {
  const allowedRoles = PERMISSIONS[permissionKey];
  if (!allowedRoles) return false;
  return hasPermission(userRole, allowedRoles);
};

/**
 * Get all roles as an array for dropdowns
 * @returns {Array<{value: string, label: string, description: string}>}
 */
export const getRoleOptions = () => {
  return Object.values(ROLES).map(role => ({
    value: role,
    label: ROLE_LABELS[role],
    description: ROLE_DESCRIPTIONS[role]
  }));
};

export default {
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  PERMISSIONS,
  hasPermission,
  canAccess,
  getRoleOptions
};
