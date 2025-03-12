import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    try {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update auth context
      setAuth({
        token: null,
        isAuthenticated: false,
        user: null
      });
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      // Still try to navigate away even if there was an error
      navigate('/');
    }
  };

  return (
    <nav className="bg-green-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Apothecary Shop</div>
        
        <div className="flex space-x-4">
          {auth?.isAuthenticated && (
            <>
              <Link to="/dashboard" className="hover:text-green-200 transition-colors">
                Dashboard
              </Link>
              <Link to="/inventory" className="hover:text-green-200 transition-colors">
                Inventory
              </Link>
              <button 
                onClick={handleLogout}
                className="hover:text-green-200 transition-colors"
              >
                Logout
              </button>
            </>
          )}
          {!auth?.isAuthenticated && (
            <Link to="/" className="hover:text-green-200 transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
