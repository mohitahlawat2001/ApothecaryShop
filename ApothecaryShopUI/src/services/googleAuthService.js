import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const googleAuthService = {
  // Handle Google OAuth callback
  handleGoogleCallback: async (token, user) => {
    try {
      // Store the token and user data
      localStorage.setItem('token', `Bearer ${token}`);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default Authorization header for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user, token };
    } catch (error) {
      console.error('Google auth callback error:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if we're returning from Google OAuth
  checkGoogleCallback: () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        return { token, user: userData };
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    
    return null;
  },

  // Clear URL parameters after successful authentication
  clearCallbackParams: () => {
    const url = new URL(window.location);
    url.searchParams.delete('token');
    url.searchParams.delete('user');
    window.history.replaceState({}, document.title, url.pathname);
  }
};
