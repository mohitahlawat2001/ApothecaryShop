import axios from 'axios';

// Get API base URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

// Validate that we have a base URL
if (!API_BASE_URL) {
  console.warn('Missing API base URL. Please set VITE_API_BASE_URL in your environment.');
}

/**
 * Get external products from JanAushadhi or other external sources
 * @param {Object} params - Search parameters
 * @param {string} params.searchText - Text to search for
 * @param {number} params.pageSize - Number of items per page
 * @param {number} params.pageNumber - Page number
 * @returns {Promise<Object>} Response containing external products
 */
export const getExternalProducts = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/external-products`, {
      params,
      headers: {
        'Authorization': `${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching external products:', error);
    throw error;
  }
};

/**
 * Get detailed information about a specific external product
 * @param {string} productId - External product ID
 * @returns {Promise<Object>} External product details
 */
export const getExternalProductDetail = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/external-products/${productId}`, {
      headers: {
        'Authorization': `${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching external product with id ${productId}:`, error);
    throw error;
  }
};