import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, API_BASE } from './config/apiConfig';
import { generateMockAnalisis } from './mocks/mockAnalisis';

console.log('Using baseURL:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log('Token utilizado:', token);
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

// Interceptor de respuesta para manejar errores comunes
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Specific handling for food selection updates
    if (error.config && error.config.url && 
        error.config.url.includes('analisis-imagen/selecciones')) {
      
      console.log('Failed to save food selections, will retry in background');
      
      // Store failed request for later retry
      try {
        const failedRequests = JSON.parse(await AsyncStorage.getItem('failedSelectionUpdates')) || [];
        failedRequests.push({
          url: error.config.url,
          method: error.config.method,
          data: error.config.data,
          timestamp: Date.now()
        });
        await AsyncStorage.setItem('failedSelectionUpdates', JSON.stringify(failedRequests));
      } catch (storageError) {
        console.error('Failed to store failed request:', storageError);
      }
      
      // Return empty success response to prevent UI errors
      return Promise.resolve({ 
        status: 200,
        data: { saved: false, message: 'Saved for later retry' }
      });
    }
    
    // Verificar si el error es de una ruta específica que podemos mockear
    if (error.config && error.config.url && 
        (error.config.url.includes('analisis-persona') || 
         error.config.url.includes('analisis-usuario'))) {
      
      console.log('Endpoint no disponible, usando datos simulados');
      
      // Extraer el ID de usuario de la URL
      const urlParts = error.config.url.split('/');
      const userId = urlParts[urlParts.length - 1].replace('/', '');
      
      if (userId) {
        // Generar datos mock y devolverlos
        return Promise.resolve({ 
          data: generateMockAnalisis(userId),
          status: 200,
          statusText: 'OK (Mock)',
          headers: {},
          config: error.config
        });
      }
    }
    
    // Log detallado del error para depuración
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// Add a function to retry failed selection updates
export const retryFailedSelectionUpdates = async () => {
  try {
    const failedRequests = JSON.parse(await AsyncStorage.getItem('failedSelectionUpdates')) || [];
    
    if (failedRequests.length === 0) {
      return;
    }
    
    console.log(`Retrying ${failedRequests.length} failed selection updates`);
    
    // Filter out requests older than 7 days
    const now = Date.now();
    const validRequests = failedRequests.filter(
      req => (now - req.timestamp) < 7 * 24 * 60 * 60 * 1000
    );
    
    // Retry each request
    for (const request of validRequests) {
      try {
        await api[request.method](request.url, JSON.parse(request.data));
      } catch (error) {
        console.log(`Failed to retry request: ${error.message}`);
      }
    }
    
    // Clear the stored requests
    await AsyncStorage.setItem('failedSelectionUpdates', JSON.stringify([]));
  } catch (error) {
    console.error('Error in retry mechanism:', error);
  }
};

export default api;

