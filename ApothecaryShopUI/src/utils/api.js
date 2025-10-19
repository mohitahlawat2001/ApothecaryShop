/**
 * Get API base URL from environment variables with validation
 * @param {string} path - The API endpoint path
 * @returns {string} The complete API URL
 */
export function getApiUrl(path = '') {
  // Get base URL from environment variables
  const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  
  // Warn if base URL is missing or contains "undefined"
  if (!base) {
    console.warn('Missing API base URL. Please set VITE_API_BASE_URL in your environment.');
  } else if (base.includes('undefined')) {
    console.warn('API base URL contains "undefined". Please check your environment configuration.');
  }
  
  // Ensure path starts with a forward slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Return the complete URL
  return `${base || ''}${normalizedPath}`;
}