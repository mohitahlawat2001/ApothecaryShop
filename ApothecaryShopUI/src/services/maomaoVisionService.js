import axios from 'axios';
import { getAuthConfig } from './authService';

// Get API base URL from environment variable with fallback
const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Validate that we have a base URL
if (!API_URL || API_URL === 'http://localhost:5000/api') {
  console.warn('Using default API URL. Please set VITE_API_BASE_URL in your environment for production.');
}

/**
 * Analyzes a product image and returns the AI analysis
 * @param {File} imageFile - The image file to analyze
 * @param {string} prompt - Optional custom prompt for the AI
 * @returns {Promise<Object>} The analysis response
 */
export async function analyzeProductImage(imageFile, prompt = '') {
  try {
    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('image', imageFile);
    if (prompt) {
      formData.append('prompt', prompt);
    }

    // Get auth config from auth service
    const config = getAuthConfig();
    
    // Set the content type for form data
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(
      `${API_URL}/vision/analyze`, 
      formData, 
      config
    );
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

/**
 * Extracts text from a product image
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<Object>} The extracted text response
 */
export async function extractTextFromImage(imageFile) {
  try {
    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('image', imageFile);

    // Get auth config from auth service
    const config = getAuthConfig();
    
    // Set the content type for form data
    config.headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(
      `${API_URL}/vision/extract-text`, 
      formData, 
      config
    );
    
    return response.data;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}