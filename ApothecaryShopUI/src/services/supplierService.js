import axios from 'axios';
import { getAuthConfig } from './authService';

const API_URL = import.meta.env.VITE_API_URL + '/suppliers';

export const getSuppliers = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const getSupplier = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

export const createSupplier = async (supplierData) => {
  const response = await axios.post(API_URL, supplierData, getAuthConfig());
  return response.data;
};

export const updateSupplier = async (id, supplierData) => {
  const response = await axios.put(`${API_URL}/${id}`, supplierData, getAuthConfig());
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};