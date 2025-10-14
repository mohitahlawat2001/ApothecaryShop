import axios from 'axios';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Get all products from the API
 * @returns {Promise<Array>} List of products
 */
export const getProducts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/products`, {
      headers: {
        'Authorization': `${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product data
 */
export const getProduct = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
      headers: {
        'Authorization': `${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new product
 * @param {Object} productData - Product data to create
 * @returns {Promise<Object>} Created product
 */
export const createProduct = async (productData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product
 * @param {string} id - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (id, productData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/products/${id}`, productData, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a product
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Response data
 */
export const deleteProduct = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/products/${id}`, {
      headers: {
        'Authorization': `${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
};

/**
 * Update product stock
 * @param {string} id - Product ID
 * @param {number} adjustment - Amount to adjust (positive for increase, negative for decrease)
 * @param {string} reason - Reason for adjustment
 * @returns {Promise<Object>} Updated product
 */
export const updateProductStock = async (id, adjustment, reason) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_BASE_URL}/products/${id}/stock`, {
      adjustment,
      reason
    }, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating stock for product with id ${id}:`, error);
    throw error;
  }
};