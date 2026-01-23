import React, { useContext, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { hasPermission } from '../../utils/roles';

/**
 * PrivateRoute - Protects routes based on authentication and optional role requirements
 * @param {Object} props
 * @param {string[]} [props.requiredRoles] - Optional array of roles that can access this route
 * @param {string} [props.redirectTo] - Where to redirect if unauthorized (default: '/')
 */
const PrivateRoute = ({ requiredRoles, redirectTo = '/' }) => {
  const { isAuthenticated, user: contextUser, loading } = useContext(AuthContext);
  
  // Fallback to localStorage if context user is null/undefined
  const user = useMemo(() => {
    if (contextUser) return contextUser;
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }, [contextUser]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If roles are required, check if user has permission
  if (requiredRoles && requiredRoles.length > 0) {
    const userHasPermission = hasPermission(user?.role, requiredRoles);
    
    if (!userHasPermission) {
      // User is authenticated but doesn't have required role
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required role (or no role required)
  return <Outlet />;
};

export default PrivateRoute;