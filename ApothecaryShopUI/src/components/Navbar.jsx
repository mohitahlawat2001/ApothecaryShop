import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { isAuthenticated, setAuth, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <nav className="bg-gradient-to-r from-green-800 to-green-700 text-white p-4 shadow-lg w-full relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
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
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated && (
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
              <Link to="/distributions" className="px-3 py-1 hover:text-green-200 hover:underline transition-all duration-300">
                Distribution
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center border-2 border-white">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user?.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user?.role?.toUpperCase() || 'USER'}
                        </span>
                      </div>
                    </div>
                    
                    {user?.role === 'admin' && (
                      <Link
                        to="/user-management"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        User Management
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/" className="px-4 py-1 bg-green-700 hover:bg-green-600 rounded-md shadow-md hover:shadow-lg transition-all duration-300">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 px-2 pt-2 pb-4 bg-green-800 rounded-md shadow-lg">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-2">
              {/* User Info */}
              <div className="px-3 py-3 bg-green-700 rounded-md mb-2">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center border-2 border-white">
                    <span className="text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-green-200">{user?.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      user?.role === 'admin' 
                        ? 'bg-purple-200 text-purple-800' 
                        : 'bg-white text-green-800'
                    }`}>
                      {user?.role?.toUpperCase() || 'USER'}
                    </span>
                  </div>
                </div>
              </div>

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
              <Link 
                to="/distributions" 
                className="block px-3 py-2 rounded hover:bg-green-700 hover:text-green-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Distribution
              </Link>
              
              {user?.role === 'admin' && (
                <Link 
                  to="/user-management" 
                  className="block px-3 py-2 rounded hover:bg-green-700 hover:text-green-200 border-t border-green-700 mt-2 pt-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    User Management
                  </div>
                </Link>
              )}
              
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="text-left px-3 py-2 rounded hover:bg-red-600 hover:text-white border-t border-green-700 mt-2"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </div>
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
