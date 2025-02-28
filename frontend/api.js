import axios from 'axios';
import { Platform } from 'react-native';

const isMobile = Platform.OS !== 'web';

const baseURL = isMobile 
  ? 'http://192.168.0.4:8000/api'
  : 'http://127.0.0.1:8000/api';

console.log('Using baseURL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 10000,
  // ...existing code...
});

export default api;
