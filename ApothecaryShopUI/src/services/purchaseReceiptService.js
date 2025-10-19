import axios from 'axios';
import { getAuthConfig } from './authService';
import { getApiUrl } from '../utils/api';

export const getPurchaseReceipts = async () => {
  const response = await axios.get(getApiUrl('/purchase-receipts'), getAuthConfig());
  return response.data;
};

export const getPurchaseReceipt = async (id) => {
  try {
    const response = await axios.get(getApiUrl(`/purchase-receipts/${id}`), getAuthConfig());
    
    // Check if response data is an array (which appears to be happening in your case)
    // and return the first item if so
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase receipt:', error);
    throw error;
  }
};

export const createPurchaseReceipt = async (receiptData) => {
  try {
    const response = await axios.post(getApiUrl('/purchase-receipts'), receiptData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error creating purchase receipt:', error);
    throw error;
  }
};