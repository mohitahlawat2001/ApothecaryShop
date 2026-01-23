import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * User Management Service
 * Handles all API calls related to user management (Admin only)
 */

// Get all users with pagination and filters
export const getAllUsers = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        'Authorization': token
      },
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        role: params.role,
        search: params.search
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: {
        'Authorization': token
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error.response?.data || { message: 'Failed to fetch user' };
  }
};

// Create a new user (Admin only)
export const createUser = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error.response?.data || { message: 'Failed to create user' };
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/users/${id}`, userData, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error.response?.data || { message: 'Failed to update user' };
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/users/${id}`, {
      headers: {
        'Authorization': token
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};

// Toggle user status
export const toggleUserStatus = async (id, isActive) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `${API_URL}/users/${id}/status`,
      { isActive },
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error.response?.data || { message: 'Failed to toggle user status' };
  }
};

// Get user statistics
export const getUserStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/stats`, {
      headers: {
        'Authorization': token
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error.response?.data || { message: 'Failed to fetch user statistics' };
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
};
