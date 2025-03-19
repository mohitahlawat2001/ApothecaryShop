import axios from 'axios';
import { getAuthConfig } from './authService';

const API_URL = import.meta.env.VITE_API_URL + '/maomao-ai';

/**
 * Generate a response from the MaoMao AI
 * @param {Object} requestData - Request data for generating AI response
 * @param {string} requestData.prompt - The prompt or question for the AI
 * @param {string} [requestData.userName='User'] - Name of the user interacting with the AI
 * @param {string} [requestData.userContext=''] - Context of the conversation or user's situation
 * @param {boolean} [requestData.clearHistory=false] - Whether to clear conversation history
 * @param {string} [requestData.outputFormat='text'] - Format of the output (text, list, sentence, html, medical, recipe)
 * @param {boolean} [requestData.structuredOutput=false] - Whether to return a structured JSON response
 * @returns {Promise<Object>} AI generated response
 */
export const generateAiResponse = async (requestData) => {
  try {
    const response = await axios.post(`${API_URL}/generate`, requestData, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};

/**
 * Generate a structured medical information response
 * @param {string} prompt - Query about a medical substance or condition
 * @returns {Promise<Object>} Structured medical information
 */
export const getMedicalInformation = async (prompt) => {
  try {
    const requestData = {
      prompt,
      outputFormat: 'medical',
      structuredOutput: true
    };
    
    const response = await generateAiResponse(requestData);
    return response;
  } catch (error) {
    console.error('Error getting medical information:', error);
    throw error;
  }
};

/**
 * Generate a herbal remedy recipe
 * @param {string} condition - Medical condition or symptoms to address
 * @returns {Promise<Object>} Recipe with ingredients and preparation steps
 */
export const getHerbalRecipe = async (condition) => {
  try {
    const requestData = {
      prompt: `Create a traditional herbal remedy for ${condition}`,
      outputFormat: 'recipe',
      structuredOutput: true
    };
    
    const response = await generateAiResponse(requestData);
    return response;
  } catch (error) {
    console.error('Error getting herbal recipe:', error);
    throw error;
  }
};

/**
 * Get a list of alternative treatments for a condition
 * @param {string} condition - Medical condition or symptoms
 * @returns {Promise<Array<string>>} List of alternative treatments
 */
export const getAlternativeTreatments = async (condition) => {
  try {
    const requestData = {
      prompt: `List alternative treatments for ${condition}`,
      outputFormat: 'list',
      structuredOutput: true
    };
    
    const response = await generateAiResponse(requestData);
    return response;
  } catch (error) {
    console.error('Error getting alternative treatments:', error);
    throw error;
  }
};

/**
 * Get product usage information for a customer inquiry
 * @param {string} productName - Name of the pharmaceutical product
 * @returns {Promise<Object>} Structured usage information
 */
export const getProductUsageInfo = async (productName) => {
  try {
    const requestData = {
      prompt: `Provide patient-friendly usage information for ${productName}`,
      userName: 'Pharmacist',
      userContext: 'Helping a customer understand medication usage',
      outputFormat: 'html',
      structuredOutput: false
    };
    
    const response = await generateAiResponse(requestData);
    return response;
  } catch (error) {
    console.error('Error getting product usage information:', error);
    throw error;
  }
};

/**
 * Get recommended products for trending diseases
 * @param {boolean} isJanAushadhi - Whether to focus on JanAushadhi products
 * @returns {Promise<Object>} List of recommended products
 */
export const getTrendingDiseaseProducts = async (isJanAushadhi = false) => {
  try {
    const prompt = isJanAushadhi 
      ? "List 5-8 essential JanAushadhi generic medicines to stock based on current seasonal disease outbreaks and trends" 
      : "List 5-8 essential medicines to stock based on current seasonal disease outbreaks and trends";
    
    const requestData = {
      prompt,
      userName: 'Procurement Manager',
      userContext: 'Planning inventory for upcoming disease outbreaks',
      outputFormat: 'list',
      structuredOutput: true
    };
    
    const response = await generateAiResponse(requestData);
    return response;
  } catch (error) {
    console.error('Error getting trending disease products:', error);
    throw error;
  }
};
