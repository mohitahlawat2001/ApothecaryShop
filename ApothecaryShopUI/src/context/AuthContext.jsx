import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: true
  });

  useEffect(() => {
    // Check if user is authenticated on initial load
    const checkAuth = async () => {
      if (localStorage.getItem('token')) {
        try {
          // Set token in axios headers
          const token = localStorage.getItem('token');
          axios.defaults.headers.common['Authorization'] = token;
          
          // Verify token with backend (optional, implement endpoint)
          // const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify`);
          
          setAuth({
            token,
            isAuthenticated: true,
            user: JSON.parse(localStorage.getItem('user')),
            loading: false
          });
        } catch (error) {
          // Token verification failed
          console.error("Authentication error:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          
          setAuth({
            token: null,
            isAuthenticated: false,
            user: null,
            loading: false
          });
        }
      } else {
        setAuth({
          ...auth,
          loading: false
        });
      }
    };

    checkAuth();
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    
    setAuth({
      token: null,
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
        loading: auth.loading,
        setAuth,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
