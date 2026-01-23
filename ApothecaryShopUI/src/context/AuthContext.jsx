import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { googleAuthService } from '../services/googleAuthService';
import { facebookAuthService } from '../services/facebookAuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let parsedUser = null;
    
    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
    }
    
    const initialState = {
      token: storedToken,
      isAuthenticated: !!(storedToken && parsedUser),
      user: parsedUser,
      loading: true
    };
    
    return initialState;
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
          
          const storedUser = JSON.parse(localStorage.getItem('user'));
          
          setAuth({
            token,
            isAuthenticated: true,
            user: storedUser,
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
          token: null,
          isAuthenticated: false,
          user: null,
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

  const setAuthWrapper = (newAuth) => {
    setAuth(newAuth);
  };

  const contextValue = {
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    loading: auth.loading,
    setAuth: setAuthWrapper,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;