import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

const PrivateRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;