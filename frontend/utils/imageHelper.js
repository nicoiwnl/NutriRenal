import { Platform } from 'react-native';

// Set the correct base URLs for accessing the backend
const WEB_BASE_URL = 'http://127.0.0.1:8000';
const MOBILE_BASE_URL = 'http://192.168.1.160:8000'; // Update this with your actual IP address

/**
 * Get the full URL for an image, falling back to a default if not provided
 * @param {string} imageUrl - The original image URL
 * @param {string} defaultImageUrl - Default image URL to use if original is not provided
 * @returns {string} - The resolved image URL
 */
export const getImageUrl = (imageUrl, defaultImageUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') => {
  if (!imageUrl) return defaultImageUrl;
  
  // If it's already a complete URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Choose the appropriate base URL based on platform
  const baseUrl = Platform.OS === 'web' ? WEB_BASE_URL : MOBILE_BASE_URL;
  
  // Clean the path - remove any leading slashes and normalize directory separators
  let cleanPath = imageUrl.replace(/^\//, '').replace(/\\/g, '/');
  
  // If the path includes "fotos" but not "media", add the media prefix
  if ((cleanPath.includes('fotos/') || cleanPath.startsWith('fotos')) && !cleanPath.includes('media/')) {
    cleanPath = `media/${cleanPath}`;
  } 
  // If it's just a filename (no slashes), assume it's in media/fotos
  else if (!cleanPath.includes('/')) {
    cleanPath = `media/fotos/${cleanPath}`;
  }
  // If we don't have media prefix, add it
  else if (!cleanPath.startsWith('media/')) {
    cleanPath = `media/${cleanPath}`;
  }
  
  // Construct and return the full URL
  return `${baseUrl}/${cleanPath}`;
};

/**
 * Special helper specifically for profile photos 
 * @param {string} photoName - Profile photo filename or path
 * @param {string} defaultImage - Default image URL to use if no photo is provided
 * @returns {string} - Complete URL to access the profile photo
 */
export const getProfileImageUrl = (photoName, defaultImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') => {
  if (!photoName) return defaultImage;
  
  // Extract just the filename if a path is provided
  const filename = photoName.split('/').pop().split('\\').pop();
  
  // Get the appropriate base URL
  const baseUrl = Platform.OS === 'web' ? WEB_BASE_URL : MOBILE_BASE_URL;
  
  // Always use the consistent media/fotos path for profile photos
  return `${baseUrl}/media/fotos/${filename}`;
};
