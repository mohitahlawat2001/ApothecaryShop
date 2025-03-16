import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
        
        {/* Hamburger menu button (mobile only) */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          {auth?.isAuthenticated && (
            <>
              <Link to="/dashboard" className="px-3 py-1 hover:text-green-200 hover:underline transition-all duration-300">
                Dashboard
              </Link>
              <Link to="/inventory" className="px-3 py-1 hover:text-green-200 hover:underline transition-all duration-300">
                Inventory
              </Link>
              <Link to="/procurement/purchase-orders" className="px-3 py-1 hover:text-green-200 hover:underline transition-all duration-300">
                Procurement
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

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 px-2 pt-2 pb-4 bg-green-800 rounded-md shadow-lg">
          {auth?.isAuthenticated ? (
            <div className="flex flex-col space-y-2">
              <Link 
                to="/dashboard" 
                className="block px-3 py-2 rounded hover:bg-green-700 hover:text-green-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/inventory" 
                className="block px-3 py-2 rounded hover:bg-green-700 hover:text-green-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Inventory
              </Link>
              <Link 
                to="/procurement/purchase-orders" 
                className="block px-3 py-2 rounded hover:bg-green-700 hover:text-green-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Procurement
              </Link>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="text-left px-3 py-2 rounded hover:bg-green-700 hover:text-green-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/" 
              className="block px-3 py-2 rounded hover:bg-green-700 hover:text-green-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
