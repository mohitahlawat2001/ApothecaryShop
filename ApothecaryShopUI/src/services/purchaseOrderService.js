import axios from 'axios';
import { getAuthConfig } from './authService';

 const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL) + '/purchase-orders';
 if (!API_URL || API_URL === '/purchase-orders') {
   console.warn('Missing API base URL. Please set VITE_API_BASE_URL in your environment.');
 }

export const getPurchaseOrders = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const getPurchaseOrder = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

export const createPurchaseOrder = async (orderData) => {
  const response = await axios.post(API_URL, orderData, getAuthConfig());
  return response.data;
};

export const updatePurchaseOrder = async (id, orderData) => {
  const response = await axios.put(`${API_URL}/${id}`, orderData, getAuthConfig());
  return response.data;
};

export const updatePurchaseOrderStatus = async (id, status) => {
  const response = await axios.patch(
    `${API_URL}/${id}/status`, 
    { status }, 
    getAuthConfig()
  );
  return response.data;
};