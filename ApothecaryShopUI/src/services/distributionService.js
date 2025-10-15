import axios from 'axios';
import { getAuthConfig } from './authService';
import { getApiUrl } from '../utils/api';

// Create new distribution
export const createDistribution = async (distributionData) => {
  const response = await axios.post(getApiUrl('/distributions'), distributionData, getAuthConfig());
  return response.data;
};

// Get all distributions
export const getDistributions = async (filters = {}) => {
  const response = await axios.get(getApiUrl('/distributions'), { 
    ...getAuthConfig(),
    params: filters 
  });
  return response.data;
};

// Get distribution by ID
export const getDistributionById = async (id) => {
  const response = await axios.get(getApiUrl(`/distributions/${id}`), getAuthConfig());
  return response.data;
};

// Update distribution status
export const updateDistributionStatus = async (id, status) => {
  const response = await axios.patch(getApiUrl(`/distributions/${id}/status`), { status }, getAuthConfig());
  return response.data;
};

// Delete distribution
export const deleteDistribution = async (id) => {
  const response = await axios.delete(getApiUrl(`/distributions/${id}`), getAuthConfig());
  return response.data;
};

// Get distribution reports
export const getDistributionReports = async (filters = {}) => {
  const response = await axios.get(getApiUrl('/distributions/reports/summary'), {
    ...getAuthConfig(),
    params: filters 
  });
  return response.data;
};

// Export distributions to CSV
export const exportDistributionsCSV = async (filters = {}) => {
  const response = await axios.get(getApiUrl('/distributions/export/csv'), {
    ...getAuthConfig(),
    params: filters,
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `distributions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Export distributions to PDF
export const exportDistributionsPDF = async (filters = {}) => {
  const response = await axios.get(getApiUrl('/distributions/export/pdf'), {
    ...getAuthConfig(),
    params: filters,
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `distributions_${new Date().toISOString().split('T')[0]}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};