import api from '../api';
import { ENDPOINTS } from '../config/apiConfig';

// Crear un caché para las solicitudes (faltaba esta propiedad)
const requestCache = new Map();

// Track in-flight requests to prevent duplicates
const pendingRequests = {};

// Near the top of the file, add this counter for debugging
let apiCallCounter = 0;

const alimentosService = {
  // Buscar alimento por nombre
  async buscarPorNombre(nombre) {
    try {
      // Create a cache key based on the search term
      const cacheKey = `alimento_search_${nombre}`;
      
      // Check cache first
      const cachedData = requestCache.get(cacheKey);
      if (cachedData) {
        console.log(`Using cached data for ${nombre}`);
        return cachedData;
      }
      
      // Add counter to see how many actual API calls are made
      apiCallCounter++;
      console.log(`API call #${apiCallCounter}: searching for ${nombre}`);
      
      // Check if there's already a pending request for this search
      if (pendingRequests[cacheKey]) {
        console.log(`Request for ${nombre} already in progress, waiting for result`);
        return await pendingRequests[cacheKey];
      }
      
      // Create promise to track this request
      const requestPromise = api.get(`${ENDPOINTS.ALIMENTOS}?search=${encodeURIComponent(nombre)}`);
      pendingRequests[cacheKey] = requestPromise;
      
      // Execute request
      const response = await requestPromise;
      
      // Cache the result
      requestCache.set(cacheKey, response.data);
      
      // Remove from pending requests
      delete pendingRequests[cacheKey];
      
      return response.data;
    } catch (error) {
      console.error('Error buscando alimento por nombre:', error);
      
      // Clean up pending request on error
      const cacheKey = `alimento_search_${nombre}`;
      delete pendingRequests[cacheKey];
      
      throw error;
    }
  },
  
  // Obtener información nutricional científica de un alimento
  async obtenerInfoNutricional(alimento) {
    try {
      // Si recibimos un objeto alimento, usamos su id
      const alimentoId = typeof alimento === 'object' ? alimento.id : alimento;
      
      // Create cache key
      const cacheKey = `alimento_info_${alimentoId}`;
      
      // Check cache first
      const cachedData = requestCache.get(cacheKey);
      if (cachedData) {
        console.log(`Using cached nutritional info for ${alimentoId}`);
        return cachedData;
      }
      
      // Si es un id, usamos el endpoint directo
      if (!isNaN(alimentoId)) {
        // Check for pending request
        if (pendingRequests[cacheKey]) {
          return await pendingRequests[cacheKey];
        }
        
        // Create promise to track this request
        const requestPromise = api.get(`${ENDPOINTS.ALIMENTOS}/${alimentoId}/`);
        pendingRequests[cacheKey] = requestPromise;
        
        const response = await requestPromise;
        
        // Cache the result
        requestCache.set(cacheKey, response.data);
        
        // Clean up pending request
        delete pendingRequests[cacheKey];
        
        return response.data;
      } 
      // Si es un string (nombre), buscamos primero
      else {
        const resultados = await this.buscarPorNombre(alimento);
        if (resultados && resultados.length > 0) {
          return resultados[0];
        }
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo información nutricional:', error);
      
      // Clean up pending request on error
      const alimentoId = typeof alimento === 'object' ? alimento.id : alimento;
      const cacheKey = `alimento_info_${alimentoId}`;
      delete pendingRequests[cacheKey];
      
      throw error;
    }
  },
  
  /**
   * Busca en la base de datos valores nutricionales para los alimentos detectados
   * @param {Object} params - Parámetros para la búsqueda
   * @returns {Promise} - Promesa con los valores actualizados
   */
  async actualizarValoresNutricionales(params) {
    try {
      // Preparar array de alimentos detectados (asegurar que sea un array)
      const alimentosDetectados = Array.isArray(params.alimentos_detectados) 
        ? params.alimentos_detectados 
        : [];
      
      if (alimentosDetectados.length === 0) {
        console.log("No hay alimentos para buscar");
        return {
          valoresNutricionales: params.totales || {
            energia: 0, proteinas: 0, hidratos_carbono: 0, lipidos: 0,
            sodio: 0, potasio: 0, fosforo: 0
          },
          alimentosActualizados: [],
          fuenteValores: 'estimacion_ia'
        };
      }
      
      // Create a unique key for this specific search request
      const requestKey = `valores_nutricionales_${alimentosDetectados.sort().join('_')}`;
      
      // Check cache first
      const cachedData = requestCache.get(requestKey);
      if (cachedData) {
        console.log(`Using cached nutritional values for ${alimentosDetectados.join(', ')}`);
        return cachedData;
      }
      
      // Check if there's already a pending request for these foods
      if (pendingRequests[requestKey]) {
        console.log(`Request for nutritional values already in progress, waiting for result`);
        return await pendingRequests[requestKey];
      }
      
      // Create a map for todos los alimentos buscados 
      const comparacionesRealizadas = new Map();
      
      // Create a promise that resolves when all alimentos are processed
      const processPromise = new Promise(async (resolve) => {
        // Buscar valores para cada alimento detectado
        const resultados = await Promise.all(
          alimentosDetectados.map(async (alimento) => {
            try {
              // NUEVO: Si ya hemos comparado este alimento antes, no repetir la búsqueda
              if (comparacionesRealizadas.has(alimento)) {
                return comparacionesRealizadas.get(alimento);
              }
              
              // Buscar alimentos en la base de datos que coincidan con el nombre
              const alimentosEncontrados = await this.buscarPorNombre(alimento);
              
              // MODIFICADO: Limitar a máximo 5 resultados para evitar procesamiento excesivo
              const alimentosFiltrados = alimentosEncontrados.slice(0, 5);
              
              // Si encontramos coincidencias
              if (alimentosFiltrados.length > 0) {
                // Buscar coincidencia exacta o muy cercana
                const coincidenciaExacta = alimentosFiltrados.find(
                  a => a.nombre.toLowerCase() === alimento.toLowerCase()
                );
                
                // Si hay una coincidencia exacta, usarla
                if (coincidenciaExacta) {
                  console.log(`Coincidencia exacta encontrada para ${alimento}: ${coincidenciaExacta.nombre}`);
                  
                  const resultado = {
                    alimento: alimento,
                    encontrado: true,
                    datos: coincidenciaExacta
                  };
                  
                  // NUEVO: Guardar el resultado para evitar repetir la búsqueda
                  comparacionesRealizadas.set(alimento, resultado);
                  return resultado;
                }
                
                // Si no hay coincidencia exacta, buscar la mejor
                const mejorCoincidencia = alimentosFiltrados[0];
                
                // NUEVO: Verificación adicional para evitar falsos positivos
                const nombreMejorCoincidencia = mejorCoincidencia.nombre.toLowerCase();
                const nombreAlimentoBuscado = alimento.toLowerCase();
                
                // Solo considerar coincidencia si el nombre contiene el alimento buscado o viceversa
                if (nombreMejorCoincidencia.includes(nombreAlimentoBuscado) || 
                    nombreAlimentoBuscado.includes(nombreMejorCoincidencia.split(' ')[0])) {
                  console.log(`Coincidencia parcial para ${alimento}: ${mejorCoincidencia.nombre}`);
                  
                  const resultado = {
                    alimento: alimento,
                    encontrado: true,
                    datos: mejorCoincidencia
                  };
                  
                  // NUEVO: Guardar el resultado para evitar repetir la búsqueda
                  comparacionesRealizadas.set(alimento, resultado);
                  return resultado;
                } else {
                  console.log(`El alimento encontrado "${mejorCoincidencia.nombre}" no corresponde realmente a "${alimento}". Ignorando.`);
                  
                  const resultado = {
                    alimento: alimento,
                    encontrado: false
                  };
                  
                  // NUEVO: Guardar el resultado para evitar repetir la búsqueda
                  comparacionesRealizadas.set(alimento, resultado);
                  return resultado;
                }
              } else {
                console.log(`No se encontró ${alimento} en la base de datos`);
                
                const resultado = {
                  alimento: alimento,
                  encontrado: false
                };
                
                // NUEVO: Guardar el resultado para evitar repetir la búsqueda
                comparacionesRealizadas.set(alimento, resultado);
                return resultado;
              }
            } catch (error) {
              console.error(`Error al buscar información nutricional para ${alimento}:`, error);
              
              // NUEVO: Guardar el resultado para evitar repetir la búsqueda
              const resultado = {
                alimento: alimento,
                encontrado: false,
                error: true
              };
              comparacionesRealizadas.set(alimento, resultado);
              return resultado;
            }
          })
        );
        
        // Process results
        // NUEVO: Usar un contador para intentos máximos
        const MAX_ATTEMPTS = 1;
        let attempts = 0;
        
        // Procesar los resultados para calcular valores nutricionales totales
        const alimentosEncontrados = resultados.filter(r => r.encontrado).map(r => r.datos);
        console.log(`Encontrados ${alimentosEncontrados.length} de ${alimentosDetectados.length} alimentos`);
        
        // Si no encontramos todos los alimentos, usar valores de IA como respaldo
        if (alimentosEncontrados.length < alimentosDetectados.length) {
          // NUEVO: Solo mostrar este mensaje una vez con el contador
          if (attempts < MAX_ATTEMPTS) {
            console.log(`Usando valores estimados por IA porque se encontraron solo ${alimentosEncontrados.length} de ${alimentosDetectados.length} alimentos`);
            attempts++;
            
            if (params.totales) {
              console.log("Valores IA disponibles:", params.totales);
            }
          }
          
          // Usar los totales de la IA si están disponibles
          if (params.totales) {
            const result = {
              valoresNutricionales: params.totales,
              alimentosActualizados: alimentosEncontrados,
              fuenteValores: 'estimacion_ia'
            };
            
            // Save to cache and return
            requestCache.set(requestKey, result);
            resolve(result);
            return;
          }
        }
        
        // Si encontramos algunos alimentos, calcular la suma de sus valores nutricionales
        if (alimentosEncontrados.length > 0) {
          // Inicializar totales en 0
          const totales = {
            energia: 0,
            proteinas: 0,
            hidratos_carbono: 0,
            lipidos: 0,
            sodio: 0,
            potasio: 0,
            fosforo: 0
          };
          
          // Sumar los valores de cada alimento
          alimentosEncontrados.forEach(alimento => {
            // Asegurar que valores sean numéricos
            totales.energia += parseFloat(alimento.energia) || 0;
            totales.proteinas += parseFloat(alimento.proteinas) || 0;
            totales.hidratos_carbono += parseFloat(alimento.hidratos_carbono) || 0;
            totales.lipidos += parseFloat(alimento.lipidos_totales || alimento.lipidos) || 0;
            totales.sodio += parseFloat(alimento.sodio) || 0;
            totales.potasio += parseFloat(alimento.potasio) || 0;
            totales.fosforo += parseFloat(alimento.fosforo) || 0;
          });
          
          const result = {
            valoresNutricionales: totales,
            alimentosActualizados: alimentosEncontrados,
            fuenteValores: 'base_datos'
          };
          
          // Save to cache and return
          requestCache.set(requestKey, result);
          resolve(result);
          return;
        }
        
        // Si no encontramos ningún alimento, devolver valores vacíos
        const result = {
          valoresNutricionales: params.totales || {
            energia: 0, proteinas: 0, hidratos_carbono: 0, lipidos: 0,
            sodio: 0, potasio: 0, fosforo: 0
          },
          alimentosActualizados: [],
          fuenteValores: 'estimacion_ia'
        };
        
        // Save to cache and return
        requestCache.set(requestKey, result);
        resolve(result);
      });
      
      // Save the promise in pendingRequests
      pendingRequests[requestKey] = processPromise;
      
      // Wait for the promise to resolve
      const result = await processPromise;
      
      // Clean up
      delete pendingRequests[requestKey];
      
      return result;
    } catch (error) {
      console.error('Error al actualizar valores nutricionales:', error);
      
      // Devolver respaldo si hay un error
      return {
        valoresNutricionales: params.totales || {
          energia: 0, proteinas: 0, hidratos_carbono: 0, lipidos: 0,
          sodio: 0, potasio: 0, fosforo: 0
        },
        alimentosActualizados: [],
        fuenteValores: 'error'
      };
    }
  }
};

export default alimentosService;
