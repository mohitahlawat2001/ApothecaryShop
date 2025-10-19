import axios from 'axios';
import { getAuthConfig } from './authService';
import { getApiUrl } from '../utils/api';

export const getSuppliers = async () => {
  const response = await axios.get(getApiUrl('/suppliers'), getAuthConfig());
  return response.data;
};

export const getSupplier = async (id) => {
  const response = await axios.get(getApiUrl(`/suppliers/${id}`), getAuthConfig());
  return response.data;
};

export const createSupplier = async (supplierData) => {
  const response = await axios.post(getApiUrl('/suppliers'), supplierData, getAuthConfig());
  return response.data;
};

export const updateSupplier = async (id, supplierData) => {
  const response = await axios.put(getApiUrl(`/suppliers/${id}`), supplierData, getAuthConfig());
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await axios.delete(getApiUrl(`/suppliers/${id}`), getAuthConfig());
  return response.data;
};