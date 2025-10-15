import axios from 'axios';
import { getAuthConfig } from './authService';
import { getApiUrl } from '../utils/api';

export const getPurchaseOrders = async () => {
  const response = await axios.get(getApiUrl('/purchase-orders'), getAuthConfig());
  return response.data;
};

export const getPurchaseOrder = async (id) => {
  const response = await axios.get(getApiUrl(`/purchase-orders/${id}`), getAuthConfig());
  return response.data;
};

export const createPurchaseOrder = async (orderData) => {
  const response = await axios.post(getApiUrl('/purchase-orders'), orderData, getAuthConfig());
  return response.data;
};

export const updatePurchaseOrder = async (id, orderData) => {
  const response = await axios.put(getApiUrl(`/purchase-orders/${id}`), orderData, getAuthConfig());
  return response.data;
};

export const updatePurchaseOrderStatus = async (id, status) => {
  const response = await axios.patch(
    getApiUrl(`/purchase-orders/${id}/status`), 
    { status }, 
    getAuthConfig()
  );
  return response.data;
};