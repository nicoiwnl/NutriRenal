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
      let valoresNutricionales = {
        energia: 0,
        proteinas: 0,
        hidratos_carbono: 0,
        lipidos: 0,
        sodio: 0,
        potasio: 0,
        fosforo: 0
      };
      
      // Verificar si tenemos valores previos de la IA para usar como respaldo
      const valoresIA = analisis.totales || {};
      let alimentosEncontrados = 0;
      let totalAlimentosBuscados = 0;
      
      // Si tenemos alimentos detectados, procesar cada uno
      if (analisis.alimentos_detectados && analisis.alimentos_detectados.length > 0) {
        // Contar cuántos alimentos vamos a buscar (excluimos los que se saltan)
        totalAlimentosBuscados = analisis.alimentos_detectados
          .filter(alimento => !skipAlimentos.includes(alimento))
          .length;
        
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
              // Verificar que el alimento encontrado realmente corresponda al buscado
              // Este es un filtro crucial para evitar falsos positivos
              const esAlimentoCorrespondiente = 
                alimentoInfo.nombre.toLowerCase().includes(nombreAlimento.toLowerCase()) ||
                nombreAlimento.toLowerCase().includes(alimentoInfo.nombre.toLowerCase());
                
              // Si no hay correspondencia real, no lo contamos como encontrado
              if (!esAlimentoCorrespondiente) {
                console.log(`El alimento encontrado "${alimentoInfo.nombre}" no corresponde realmente a "${nombreAlimento}". Ignorando.`);
                continue;
              }
              
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
                info: alimentoInfo,
                fuente: 'base_datos'
              });
              
              alimentosEncontrados++;
            }
          } catch (err) {
            console.log(`No se encontró información para ${nombreAlimento}`);
          }
        }
      }
      
      // Si no encontramos TODOS los alimentos en la BD (o encontramos muy pocos),
      // usamos los valores estimados por la IA
      // NUEVA LÓGICA: Si encontramos menos de la mitad de los alimentos, usar IA
      if ((alimentosEncontrados < (totalAlimentosBuscados / 2)) && Object.keys(valoresIA).length > 0) {
        console.log(`Usando valores estimados por IA porque se encontraron solo ${alimentosEncontrados} de ${totalAlimentosBuscados} alimentos`);
        console.log('Valores IA disponibles:', valoresIA);
        
        // Usar los valores de la IA directamente
        valoresNutricionales = {
          energia: parseFloat(valoresIA.energia || 0),
          proteinas: parseFloat(valoresIA.proteinas || 0),
          hidratos_carbono: parseFloat(valoresIA.hidratos_carbono || 0),
          lipidos: parseFloat(valoresIA.lipidos || 0),
          sodio: parseFloat(valoresIA.sodio || 0),
          potasio: parseFloat(valoresIA.potasio || 0),
          fosforo: parseFloat(valoresIA.fosforo || 0)
        };
        
        // Devolver la información actualizada con indicación de fuente IA
        return {
          alimentosActualizados,
          valoresNutricionales,
          todosEncontrados: false,
          fuenteValores: 'estimacion_ia'
        };
      }
      
      // Devolver la información actualizada con la fuente correcta de datos
      return {
        alimentosActualizados,
        valoresNutricionales,
        todosEncontrados: alimentosEncontrados === totalAlimentosBuscados,
        fuenteValores: alimentosEncontrados > 0 ? 'base_datos' : 'estimacion_ia'
      };
    } catch (error) {
      console.error('Error actualizando valores nutricionales:', error);
      
      // Si hay error pero tenemos valores de IA, usarlos como fallback
      if (analisis.totales && Object.keys(analisis.totales).length > 0) {
        console.log('Error en BD, usando valores IA como fallback');
        return {
          alimentosActualizados: [],
          valoresNutricionales: {
            energia: parseFloat(analisis.totales.energia || 0),
            proteinas: parseFloat(analisis.totales.proteinas || 0),
            hidratos_carbono: parseFloat(analisis.totales.hidratos_carbono || 0),
            lipidos: parseFloat(analisis.totales.lipidos || 0),
            sodio: parseFloat(analisis.totales.sodio || 0),
            potasio: parseFloat(analisis.totales.potasio || 0),
            fosforo: parseFloat(analisis.totales.fosforo || 0)
          },
          todosEncontrados: false,
          fuenteValores: 'estimacion_ia'
        };
      }
      
      throw error;
    }
  }
};

export default alimentosService;
