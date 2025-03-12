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
    <nav className="bg-gradient-to-r from-green-800 to-green-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold tracking-wide">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-green-200">🌿</span>
            <span className="hover:text-green-200 transition-all duration-300">Apothecary Shop</span>
          </Link>
        </div>
        
        <div className="flex space-x-6">
          {auth?.isAuthenticated && (
            <>
              <Link to="/dashboard" className="px-3 py-1 hover:text-green-200 hover:underline transition-all duration-300">
                Dashboard
              </Link>
              <Link to="/inventory" className="px-3 py-1 hover:text-green-200 hover:underline transition-all duration-300">
                Inventory
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-1 bg-green-700 hover:bg-green-600 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
              >
                Logout
              </button>
            </>
          )}
          {!auth?.isAuthenticated && (
            <Link to="/" className="px-4 py-1 bg-green-700 hover:bg-green-600 rounded-md shadow-md hover:shadow-lg transition-all duration-300">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
