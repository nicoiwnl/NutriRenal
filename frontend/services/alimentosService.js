import api from '../api';
import { ENDPOINTS } from '../config/apiConfig';

// Servicio para manejar las operaciones relacionadas con alimentos
export const alimentosService = {
  // Buscar alimento por nombre
  async buscarPorNombre(nombre) {
    try {
      const response = await api.get(`${ENDPOINTS.ALIMENTOS}?search=${encodeURIComponent(nombre)}`);
      return response.data;
    } catch (error) {
      console.error('Error buscando alimento por nombre:', error);
      throw error;
    }
  },
  
  // Obtener información nutricional científica de un alimento
  async obtenerInfoNutricional(alimento) {
    try {
      // Si recibimos un objeto alimento, usamos su id
      const alimentoId = typeof alimento === 'object' ? alimento.id : alimento;
      
      // Si es un id, usamos el endpoint directo
      if (!isNaN(alimentoId)) {
        const response = await api.get(`${ENDPOINTS.ALIMENTOS}/${alimentoId}/`);
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
      throw error;
    }
  },
  
  // Actualizar valores nutricionales de un análisis con datos científicos
  async actualizarValoresNutricionales(analisis, skipAlimentos = []) {
    try {
      const alimentosActualizados = [];
      const valoresNutricionales = {
        energia: 0,
        proteinas: 0,
        hidratos_carbono: 0,
        lipidos: 0,
        sodio: 0,
        potasio: 0,
        fosforo: 0
      };
      
      // Si tenemos alimentos detectados, procesar cada uno
      if (analisis.alimentos_detectados && analisis.alimentos_detectados.length > 0) {
        for (const nombreAlimento of analisis.alimentos_detectados) {
          // Skip foods the user has already selected
          if (skipAlimentos.includes(nombreAlimento)) {
            console.log(`Skipping "${nombreAlimento}" because it was already selected by user`);
            continue;
          }
          
          try {
            // Buscar en la base de datos
            const alimentoInfo = await this.obtenerInfoNutricional(nombreAlimento);
            
            if (alimentoInfo) {
              // Acumular valores nutricionales
              valoresNutricionales.energia += alimentoInfo.energia || 0;
              valoresNutricionales.proteinas += alimentoInfo.proteinas || 0;
              valoresNutricionales.hidratos_carbono += alimentoInfo.hidratos_carbono || 0;
              valoresNutricionales.lipidos += alimentoInfo.lipidos || 0;
              valoresNutricionales.sodio += alimentoInfo.sodio || 0;
              valoresNutricionales.potasio += alimentoInfo.potasio || 0;
              valoresNutricionales.fosforo += alimentoInfo.fosforo || 0;
              
              // Guardar el alimento encontrado
              alimentosActualizados.push({
                nombre: nombreAlimento,
                info: alimentoInfo
              });
            }
          } catch (err) {
            console.log(`No se encontró información para ${nombreAlimento}`);
          }
        }
      }
      
      // Devolver la información actualizada
      return {
        alimentosActualizados,
        valoresNutricionales,
        todosEncontrados: alimentosActualizados.length === (analisis.alimentos_detectados.length - skipAlimentos.length)
      };
    } catch (error) {
      console.error('Error actualizando valores nutricionales:', error);
      throw error;
    }
  }
};

export default alimentosService;
