import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isMobile = Platform.OS !== 'web';

const baseURL = isMobile 
  ? 'http://192.168.0.2:8000/api'
  : 'http://127.0.0.1:8000/api';

console.log('Using baseURL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error getting token for request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

