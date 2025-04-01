import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isMobile = Platform.OS !== 'web';

const baseURL = isMobile 
  ? 'http://192.168.1.18:8000/api'
  : 'http://127.0.0.1:8000/api';

console.log('Using baseURL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      // Add auth token
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error configurando la solicitud API:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;

