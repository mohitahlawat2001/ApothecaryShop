/**
 * Regex utility functions for safe regex operations
 */

/**
 * Escapes regex metacharacters to prevent ReDoS attacks
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string safe for regex use
 */
const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
  escapeRegex
};
