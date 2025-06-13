import api from '../api';
import { ENDPOINTS } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AÑADIR ESTE IMPORT

const analysisService = {
  /**
   * Updates the food selection for a specific analysis
   * @param {number|string} analisisId - The ID of the analysis to update
   * @param {object} selectedFood - The selected food object with specific details
   * @param {string} originalFoodName - The original detected food name
   * @param {object} nutritionalValues - Updated nutritional values
   * @returns {Promise} - API response
   */
  updateFoodSelection: async (analisisId, selectedFood, originalFoodName, nutritionalValues) => {
    if (!analisisId) {
      console.warn("No analysis ID provided for updating selections");
      return null;
    }
    
    try {
      // Prepare the updated data for the analysis
      const updateData = {
        // Add a complete persistent structure for user selections
        user_selections: {
          foods: {
            [originalFoodName]: {
              selected_variant: selectedFood.nombre,
              selected_unit: selectedFood.unidad_seleccionada?.nombre || "porción",
              selected_quantity: selectedFood.cantidad_seleccionada || 1,
              food_id: selectedFood.id,
              nutritional_values: selectedFood.valores_ajustados || nutritionalValues
            }
          }
        },
        // Add a simpler structure that's backward compatible with our frontend
        seleccionesEspecificas: {
          [originalFoodName]: selectedFood.nombre
        },
        foodsWithUnits: {
          [selectedFood.nombre]: `${selectedFood.cantidad_seleccionada} ${selectedFood.unidad_seleccionada?.abreviacion || 'porción'}`
        },
        // Include a flag to indicate this analysis has user customizations
        has_user_customizations: true
      };
      
      console.log(`Updating analysis ${analisisId} with user selections:`, updateData);
      
      // Debug the exact URL we're using
      const endpoint = ENDPOINTS.UPDATE_ANALISIS_SELECCION(analisisId);
      console.log(`Using update endpoint: ${endpoint}`);
      
      // Send the update request
      const response = await api.patch(endpoint, updateData);
      
      console.log('Analysis update success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating analysis with user selections:', error);
      throw error;
    }
  },
  
  /**
   * Gets a saved analysis with user selections included
   * @param {number|string} analisisId - The ID of the analysis to fetch
   * @returns {Promise} - API response with analysis data
   */
  getAnalysisWithUserSelections: async (analisisId) => {
    try {
      // Use the correct endpoint to get full analysis details
      const response = await api.get(`${ENDPOINTS.ANALISIS_IMAGEN}/${analisisId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analysis with user selections:', error);
      throw error;
    }
  },
  
  /**
   * Gets all analyses for a user
   * @param {string} userId - The user ID
   * @returns {Promise} - API response with array of analyses
   */
  getUserAnalyses: async (userId) => {
    try {
      const response = await api.get(ENDPOINTS.MIS_ANALISIS(userId));
      return response.data;
    } catch (error) {
      console.error('Error fetching user analyses:', error);
      throw error;
    }
  },
  
  /**
   * Reprocesses the given analysis data to ensure user selections are properly extracted
   * @param {object} analysisData - The analysis data to process
   * @returns {object} - Processed analysis data with user selections
   */
  processAnalysisData: (analysisData) => {
    if (!analysisData) return null;
    
    // Create a structured result with proper defaults
    const processed = {
      ...analysisData,
      seleccionesEspecificas: {},
      foodsWithUnits: {},
      alimentos_detectados: []
    };
    
    try {
      // Process resultado if it exists
      if (analysisData.resultado) {
        if (typeof analysisData.resultado === 'string') {
          try {
            processed.resultado = JSON.parse(analysisData.resultado);
          } catch (e) {
            console.error("Could not parse resultado as JSON:", e);
            processed.resultado = { error: "Could not parse resultado" };
          }
        } else {
          processed.resultado = analysisData.resultado;
        }
        
        // Extract fields from resultado
        processed.alimentos_detectados = processed.resultado.alimentos_detectados || [];
        processed.recomendaciones = processed.resultado.recomendaciones;
        processed.totales = processed.resultado.totales;
      }
      
      // Extract foods from texto_original if needed
      if (!processed.alimentos_detectados?.length && analysisData.texto_original) {
        try {
          const jsonMatch = analysisData.texto_original.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            const jsonContent = JSON.parse(jsonMatch[1]);
            processed.alimentos_detectados = jsonContent.alimentos_detectados || [];
          }
        } catch (e) {
          console.log("Could not parse texto_original");
        }
      }
      
      // Process user selections from all possible locations
      // 1. Look in user_selections at root level
      if (analysisData.user_selections?.foods) {
        Object.entries(analysisData.user_selections.foods).forEach(([original, selection]) => {
          const variant = selection.selected_variant;
          const unitInfo = selection.display_unit || 
            `${selection.selected_quantity || 1} ${selection.selected_unit || 'porción'}`;
          
          processed.seleccionesEspecificas[original] = variant;
          processed.foodsWithUnits[variant] = unitInfo;
        });
      }
      
      // 2. Look in seleccionesEspecificas at root level
      if (analysisData.seleccionesEspecificas) {
        processed.seleccionesEspecificas = {
          ...processed.seleccionesEspecificas,
          ...analysisData.seleccionesEspecificas
        };
      }
      
      // 3. Look in foodsWithUnits at root level
      if (analysisData.foodsWithUnits) {
        processed.foodsWithUnits = {
          ...processed.foodsWithUnits,
          ...analysisData.foodsWithUnits
        };
      }
      
      // 4. Look in resultado for the same fields
      if (processed.resultado) {
        if (processed.resultado.user_selections?.foods) {
          Object.entries(processed.resultado.user_selections.foods).forEach(([original, selection]) => {
            const variant = selection.selected_variant;
            const unitInfo = selection.display_unit || 
              `${selection.selected_quantity || 1} ${selection.selected_unit || 'porción'}`;
            
            processed.seleccionesEspecificas[original] = variant;
            processed.foodsWithUnits[variant] = unitInfo;
          });
        }
        
        if (processed.resultado.seleccionesEspecificas) {
          processed.seleccionesEspecificas = {
            ...processed.seleccionesEspecificas,
            ...processed.resultado.seleccionesEspecificas
          };
        }
        
        if (processed.resultado.foodsWithUnits) {
          processed.foodsWithUnits = {
            ...processed.foodsWithUnits,
            ...processed.resultado.foodsWithUnits
          };
        }
      }
      
      return processed;
    } catch (error) {
      console.error("Error processing analysis data:", error);
      return analysisData; // Return original data if processing fails
    }
  },
  
  /**
   * Makes a specific API call to fetch the analysis with its user selections
   * This should be a direct API call separate from the normal analysis data
   */
  fetchAnalysisWithSelections: async (analisisId) => {
    try {
      // Make a direct GET request to ensure we get the latest data
      const url = `${ENDPOINTS.ANALISIS_IMAGEN}/${analisisId}/user_selections/`;
      console.log(`Fetching selections from: ${url}`);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user selections for analysis:', error);
      // Return null but don't throw to avoid UI disruption
      return null;
    }
  },
  
  /**
   * Guarda una selección específica de alimento para un análisis usando el nuevo modelo SeleccionesAnalisis
   * @param {string} analisisId - ID del análisis
   * @param {object} seleccionAlimento - Objeto con datos del alimento seleccionado
   * @param {string} alimentoOriginal - Nombre del alimento detectado originalmente
   * @param {object} valoresNutricionalesAjustados - Valores nutricionales calculados
   * @returns {Promise} - Respuesta de la API
   */
  saveSeleccionAnalisis: async (analisisId, seleccionAlimento, alimentoOriginal, valoresNutricionalesAjustados) => {
    if (!analisisId || !seleccionAlimento || !alimentoOriginal) {
      console.warn("Faltan datos para la selección de alimento");
      return null;
    }
    
    try {
      // Obtener ID del usuario actual desde AsyncStorage
      let personaId = null;
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const userDataObj = JSON.parse(userData);
          personaId = userDataObj.persona_id || userDataObj.id_persona || userDataObj.id;
        }
      } catch (error) {
        console.error('Error al obtener ID de usuario:', error);
      }
      
      // Si no se pudo obtener de userData, usar el ID de usuario del análisis
      if (!personaId && analisisId) {
        try {
          // Intentar obtener el ID de persona del análisis actual
          const response = await api.get(`${ENDPOINTS.ANALISIS_IMAGEN}/${analisisId}/`);
          if (response.data && (response.data.id_persona || response.data.persona_id)) {
            personaId = response.data.id_persona || response.data.persona_id;
            console.log(`Usando ID de persona del análisis: ${personaId}`);
          }
        } catch (error) {
          console.error('No se pudo obtener la persona del análisis:', error);
        }
      }
      
      if (!personaId) {
        console.error('No se pudo determinar el ID de la persona para guardar la selección');
        return null;
      }
      
      console.log(`Guardando selección de alimento para análisis ${analisisId}, usuario ${personaId}`);
      
      // Construir el payload para la API del modelo SeleccionesAnalisis
      const payload = {
        analisis: analisisId,
        persona: personaId,
        alimento_original: alimentoOriginal,
        alimento_seleccionado: seleccionAlimento.id,
        unidad_medida: seleccionAlimento.unidad_seleccionada?.id || 1,
        cantidad: seleccionAlimento.cantidad_seleccionada || 1
      };
      
      console.log("Payload para guardar selección:", payload);
      
      // Hacer la petición POST a la API
      const response = await api.post(`${ENDPOINTS.SELECCIONES_ANALISIS}/`, payload);
      
      console.log("Selección guardada exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error al guardar selección de alimento:', error);
      // También guardar la selección de manera temporal en el campo user_selections del análisis
      try {
        // Actualizar el análisis con la selección directamente en el análisis
        await api.patch(`${ENDPOINTS.ANALISIS_IMAGEN}/${analisisId}/`, {
          user_selections: {
            foods: {
              [alimentoOriginal]: {
                selected_variant: seleccionAlimento.nombre,
                selected_unit: seleccionAlimento.unidad_seleccionada?.nombre || "porción",
                selected_quantity: seleccionAlimento.cantidad_seleccionada || 1,
                food_id: seleccionAlimento.id,
                nutritional_values: seleccionAlimento.valores_ajustados || valoresNutricionalesAjustados
              }
            }
          }
        });
        console.log("Selección guardada como fallback en el análisis");
      } catch (secondError) {
        console.error('Error en fallback de guardado:', secondError);
      }
      throw error;
    }
  },
  
  /**
   * Obtiene todas las selecciones para un análisis específico
   * @param {string} analisisId - ID del análisis
   * @returns {Promise} - Lista de selecciones del análisis
   */
  getAnalysisSelections: async (analisisId) => {
    if (!analisisId) return [];
    
    try {
      // Use cache to prevent repeated calls
      if (global._cachedSelections && global._cachedSelections[analisisId]) {
        console.log(`Using cached selections for analysis ${analisisId}`);
        return global._cachedSelections[analisisId];
      }
      
      console.log(`Getting selections for analysis ${analisisId}`);
      
      // FIXED: Use direct endpoint that we know exists with analisis filter parameter
      const response = await api.get(`${ENDPOINTS.SELECCIONES_ANALISIS}?analisis=${analisisId}`);
      console.log(`Found ${response.data.length} selections for this analysis`);
      
      // Cache the response for future use
      if (!global._cachedSelections) global._cachedSelections = {};
      global._cachedSelections[analisisId] = response.data;
      
      return response.data;
    } catch (error) {
      console.error('Error getting analysis selections:', error);
      
      // Plan B: Try to get full analysis and extract selections from there
      try {
        console.log('Trying fallback: getting complete analysis...');
        
        // Check cache for the full analysis
        if (global._cachedAnalysis && global._cachedAnalysis[analisisId]) {
          const cachedData = global._cachedAnalysis[analisisId];
          return extractSelectionsFromAnalysis(cachedData);
        }
        
        // Get full analysis directly
        const analysisResponse = await api.get(`${ENDPOINTS.ANALISIS_IMAGEN}/${analisisId}/`);
        
        // Cache the full analysis response
        if (!global._cachedAnalysis) global._cachedAnalysis = {};
        global._cachedAnalysis[analisisId] = analysisResponse.data;
        
        return extractSelectionsFromAnalysis(analysisResponse.data);
      } catch (secondError) {
        console.error('Plan B also failed:', secondError);
        
        // Plan C: Try to get all selections and filter locally
        try {
          console.log('Trying Plan C: Getting all selections and filtering locally');
          const allSelectionsResponse = await api.get(`${ENDPOINTS.SELECCIONES_ANALISIS}`);
          
          if (allSelectionsResponse.data && Array.isArray(allSelectionsResponse.data)) {
            const filteredSelections = allSelectionsResponse.data.filter(
              selection => selection.analisis === analisisId
            );
            
            console.log(`Found ${filteredSelections.length} selections through local filtering`);
            return filteredSelections;
          }
        } catch (thirdError) {
          console.error('Plan C also failed:', thirdError);
        }
        
        return [];
      }
    }
  }
};

// Helper function to extract selections from analysis data
function extractSelectionsFromAnalysis(data) {
  if (!data) return [];
  
  // Check for user_selections.foods format
  if (data.user_selections?.foods) {
    console.log('Found selections in user_selections.foods format');
    return Object.entries(data.user_selections.foods).map(([alimento_original, datos]) => ({
      alimento_original,
      alimento_seleccionado: { 
        nombre: datos.selected_variant,
        id: datos.food_id
      },
      unidad_medida: {
        nombre: datos.selected_unit,
        abreviacion: typeof datos.selected_unit === 'string' ? 
          datos.selected_unit : datos.selected_unit?.abreviacion || 'porción'
      },
      cantidad: datos.selected_quantity || 1
    }));
  } 
  // Check for seleccionesEspecificas format
  else if (data.seleccionesEspecificas && Object.keys(data.seleccionesEspecificas).length > 0) {
    console.log('Found selections in seleccionesEspecificas format');
    return Object.entries(data.seleccionesEspecificas).map(([alimento_original, nombre]) => ({
      alimento_original,
      alimento_seleccionado: { 
        nombre
      },
      unidad_medida: {
        nombre: 'porción',
        abreviacion: 'u'
      },
      cantidad: 1
    }));
  }
  
  // Look also in data.resultado if it exists
  if (data.resultado) {
    // Try as object first
    if (typeof data.resultado === 'object') {
      if (data.resultado.user_selections?.foods) {
        return extractSelectionsFromAnalysis(data.resultado);
      }
    } 
    // Try parsing if it's a string
    else if (typeof data.resultado === 'string') {
      try {
        const parsedResultado = JSON.parse(data.resultado);
        return extractSelectionsFromAnalysis(parsedResultado);
      } catch (e) {
        console.log('Could not parse resultado as JSON');
      }
    }
  }
  
  return [];
}

export default analysisService;
