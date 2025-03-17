import axios from 'axios';
import { getAuthConfig } from './authService';

const API_URL = import.meta.env.VITE_API_URL+'/distributions';

// Create new distribution
export const createDistribution = async (distributionData) => {
  const response = await axios.post(API_URL, distributionData, getAuthConfig());
  return response.data;
};

// Get all distributions
export const getDistributions = async (filters = {}) => {
  const response = await axios.get(API_URL, { 
    ...getAuthConfig(),
    params: filters 
  });
  return response.data;
};

// Get distribution by ID
export const getDistributionById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

// Update distribution status
export const updateDistributionStatus = async (id, status) => {
  const response = await axios.patch(`${API_URL}/${id}/status`, { status }, getAuthConfig());
  return response.data;
};

// Delete distribution
export const deleteDistribution = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

// Get distribution reports
export const getDistributionReports = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/reports/summary`, {
    ...getAuthConfig(),
    params: filters 
  });
  return response.data;
};