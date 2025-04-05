import { Platform } from 'react-native';

// Set the correct base URLs for accessing the backend
const WEB_BASE_URL = 'http://127.0.0.1:8000';
const MOBILE_BASE_URL = 'http://192.168.1.27:8000'; // Update this with your actual IP address

/**
 * Gets the correct URL for an image stored on the backend
 * @param {string} imagePath - The path or filename of the image
 * @param {string} defaultImage - URL to use if image path is invalid
 * @returns {string} - Complete URL to access the image
 */
export const getImageUrl = (imagePath, defaultImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') => {
  // Return default image if path is undefined, null or empty
  if (!imagePath || imagePath.trim() === '') {
    return defaultImage;
  }
  
  // If it's already a complete URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Choose the appropriate base URL based on platform
  const baseUrl = Platform.OS === 'web' ? WEB_BASE_URL : MOBILE_BASE_URL;
  
  // Clean the path - remove any leading slashes and normalize directory separators
  let cleanPath = imagePath.replace(/^\//, '').replace(/\\/g, '/');
  
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
