 import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import ThemeToggler from './ThemeToggler'; //  1. IMPORT THEME TOGGLER

const Navbar = () => {
  const { isAuthenticated, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuth({
        token: null,
        isAuthenticated: false,
        user: null
      });
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/');
    }
  };

  return (
    //  2. ADD DARK MODE CLASSES TO THE NAVBAR
    <nav className="bg-gradient-to-r from-green-800 to-green-700 dark:from-gray-900 dark:to-gray-800 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold tracking-wide">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-green-200 dark:text-green-400">🌿</span>
            <span className="hover:text-green-200 dark:hover:text-green-300 transition-all duration-300">Apothecary Shop</span>
          </Link>
        </div>
        
        {/* Hamburger menu button (mobile only) */}
        <div className="md:hidden flex items-center space-x-2">
           {isAuthenticated && <ThemeToggler />} {/* 3. ADD TOGGLER TO MOBILE VIEW HEADER */}
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
              {/*  ADD DARK MODE CLASSES TO LINKS */}
              <Link to="/dashboard" className="px-3 py-1 text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-white hover:underline transition-all duration-300">
                Dashboard
              </Link>
              <Link to="/inventory" className="px-3 py-1 text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-white hover:underline transition-all duration-300">
                Inventory
              </Link>
              <Link to="/procurement/purchase-orders" className="px-3 py-1 text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-white hover:underline transition-all duration-300">
                Procurement
              </Link>
              <Link to="/distributions" className="px-3 py-1 text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-white hover:underline transition-all duration-300">
                Distribution
              </Link>
              <ThemeToggler /> {/*  3. ADD TOGGLER TO DESKTOP VIEW */}
              <button 
                onClick={handleLogout}
                className="px-4 py-1 bg-green-700 dark:bg-red-600 hover:bg-green-600 dark:hover:bg-red-700 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
              >
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <ThemeToggler />
              <Link to="/" className="px-4 py-1 bg-green-700 hover:bg-green-600 rounded-md shadow-md hover:shadow-lg transition-all duration-300">
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 px-2 pt-2 pb-4 bg-green-800 dark:bg-gray-800 rounded-md shadow-lg">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-2">
              <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-700 hover:text-green-200" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/inventory" className="block px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-700 hover:text-green-200" onClick={() => setIsMenuOpen(false)}>
                Inventory
              </Link>
              <Link to="/procurement/purchase-orders" className="block px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-700 hover:text-green-200" onClick={() => setIsMenuOpen(false)}>
                Procurement
              </Link>
              <Link to="/distributions" className="block px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-700 hover:text-green-200" onClick={() => setIsMenuOpen(false)}>
                Distribution
              </Link>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="text-left px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-700 hover:text-green-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/" className="block px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-700 hover:text-green-200" onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;