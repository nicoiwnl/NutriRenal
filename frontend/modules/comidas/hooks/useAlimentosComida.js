import { useState, useEffect } from 'react';
import api from '../../../api';

export default function useAlimentosComida(comida) {
  const [loading, setLoading] = useState(true);
  const [alimentosDetectados, setAlimentosDetectados] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [error, setError] = useState(null);
  
  // Lista de alimentos comunes para buscar en descripciones
  const alimentosComunes = [
    'pan', 'leche', 'queso', 'huevo', 'arroz', 'fideos', 'pollo', 'carne', 
    'pescado', 'manzana', 'naranja', 'plátano', 'yogurt', 'papa', 'tomate', 
    'lechuga', 'zanahoria', 'cebolla', 'ajo', 'té', 'café', 'jugo', 'agua',
    'avena', 'cereal', 'hallulla', 'marraqueta', 'palta', 'aguacate', 'jamón',
    'mermelada', 'mantequilla', 'aceite', 'sal', 'azúcar', 'pimienta', 'bebida',
    'fruta', 'ensalada'
  ];

  // Cargar unidades de medida al inicializar
  useEffect(() => {
    const fetchUnidadesMedida = async () => {
      try {
        // Valor por defecto para unidad estándar
        const defaultUnit = {
          id: 0,
          nombre: '100ml/g (valor por defecto)',
          equivalencia_ml: 100,
          equivalencia_g: 100,
          es_volumen: true
        };

        const response = await api.get('/unidades-medida/');
        
        const processedUnits = response.data.map(unit => ({
          ...unit,
          id: typeof unit.id === 'string' ? parseInt(unit.id, 10) : unit.id
        }));
        
        setUnidadesMedida([defaultUnit, ...processedUnits]);
      } catch (error) {
        console.error('Error al cargar unidades de medida:', error);
        setUnidadesMedida([{
          id: 0,
          nombre: 'Porción estándar',
          equivalencia_ml: 100,
          equivalencia_g: 100,
          es_volumen: true
        }]);
      }
    };

    fetchUnidadesMedida();
  }, []);

  useEffect(() => {
    const detectarAlimentos = async () => {
      if (!comida || !comida.desc) {
        setAlimentosDetectados([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Convertir la descripción a minúsculas para comparación
        const descripcionLower = comida.desc.toLowerCase();
        
        // Buscar coincidencias de alimentos en la descripción
        const coincidencias = alimentosComunes.filter(alimento => 
          descripcionLower.includes(alimento)
        );
        
        // Si encontramos coincidencias, buscar en la API para obtener detalles
        if (coincidencias.length > 0) {
          const alimentosEncontrados = [];
          
          // Para cada coincidencia, buscar en la API
          for (const termino of coincidencias) {
            try {
              const response = await api.get(`/alimentos/?search=${termino}`);
              
              // Si encontramos resultados, añadirlos a la lista
              if (response.data && response.data.length > 0) {
                // Tomar los primeros 2 resultados para cada término
                const resultadosFiltrados = response.data.slice(0, 2).map(item => ({
                  ...item,
                  termino_busqueda: termino
                }));
                
                alimentosEncontrados.push(...resultadosFiltrados);
              }
            } catch (error) {
              console.log(`Error buscando alimento "${termino}":`, error);
            }
          }
          
          // Eliminar duplicados basados en el ID
          const uniqueAlimentos = alimentosEncontrados.filter((item, index, self) =>
            index === self.findIndex(t => t.id === item.id)
          );
          
          // Limitar a máximo 5 alimentos para no sobrecargar la interfaz
          setAlimentosDetectados(uniqueAlimentos.slice(0, 5));
        } else {
          setAlimentosDetectados([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al detectar alimentos:', error);
        setError('No se pudieron detectar alimentos en la descripción');
        setLoading(false);
      }
    };
    
    detectarAlimentos();
  }, [comida]);

  return {
    loading,
    alimentosDetectados,
    unidadesMedida,
    error
  };
}
