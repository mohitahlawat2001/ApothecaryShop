import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { googleAuthService } from '../services/googleAuthService';
import { facebookAuthService } from '../services/facebookAuthService';

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
      // First, check if we're returning from Google OAuth
      const googleCallback = googleAuthService.checkGoogleCallback();
      if (googleCallback) {
        const result = await googleAuthService.handleGoogleCallback(googleCallback.token, googleCallback.user);
        if (result.success) {
          setAuth({
            token: result.token,
            isAuthenticated: true,
            user: result.user,
            loading: false
          });
          googleAuthService.clearCallbackParams();
          return;
        }
      }

      // Check if we're returning from Facebook OAuth
      const facebookCallback = facebookAuthService.checkFacebookCallback();
      if (facebookCallback) {
        const result = await facebookAuthService.handleFacebookCallback(facebookCallback.token, facebookCallback.user);
        if (result.success) {
          setAuth({
            token: result.token,
            isAuthenticated: true,
            user: result.user,
            loading: false
          });
          facebookAuthService.clearCallbackParams();
          return;
        }
      }

      if (localStorage.getItem('token')) {
        try {
          // Set token in axios headers
          const token = localStorage.getItem('token');
          axios.defaults.headers.common['Authorization'] = token;
          
          // Verify token with backend (optional, implement endpoint)
          // const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/verify`);
          
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