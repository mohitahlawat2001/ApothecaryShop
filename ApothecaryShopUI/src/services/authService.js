import axios from 'axios';
const API_URL = 'http://localhost:5000/api';


/**
 * Get authentication configuration with bearer token
 * @returns {Object} Configuration object with auth headers
 */
export const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `${token}`
    }
  };
};

/**
 * Login user
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise} Response data with token and user info
 */
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  const { token, user } = response.data;
  
  // Store token and user in localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Set default authorization header
  axios.defaults.headers.common['Authorization'] = token;
  
  return response.data;
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} Response data
 */
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage', error);
    return null;
  }
};

/**
 * Verify token validity with backend (optional implementation)
 * @returns {Promise} Response data
 */
export const verifyToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/verify`, getAuthConfig());
    return response.data;
  } catch (error) {
    logout(); // Automatically logout on verification failure
    throw error;
  }
};
