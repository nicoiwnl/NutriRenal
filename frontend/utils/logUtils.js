/**
 * Enhanced logging utility for API operations
 */

// Enable or disable verbose logging
const DEBUG = true;

/**
 * Log API request details
 * @param {string} operation - The operation being performed (e.g., 'PUT', 'GET')
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data being sent
 */
export const logApiRequest = (operation, endpoint, data = null) => {
  if (!DEBUG) return;
  
  console.group(`🚀 API ${operation} Request to ${endpoint}`);
  console.log('Time:', new Date().toISOString());
  if (data) {
    console.log('Payload:', data);
  }
  console.groupEnd();
};

/**
 * Log API response details
 * @param {string} operation - The operation being performed
 * @param {string} endpoint - The API endpoint
 * @param {Object} response - The response object
 * @param {boolean} isError - Whether this is an error response
 */
export const logApiResponse = (operation, endpoint, response, isError = false) => {
  if (!DEBUG) return;
  
  const icon = isError ? '❌' : '✅';
  console.group(`${icon} API ${operation} Response from ${endpoint}`);
  console.log('Time:', new Date().toISOString());
  console.log('Status:', isError ? response?.status || 'Unknown' : 'Success');
  console.log('Data:', isError ? response?.data || response : response);
  console.groupEnd();
};

export default {
  logApiRequest,
  logApiResponse,
};
