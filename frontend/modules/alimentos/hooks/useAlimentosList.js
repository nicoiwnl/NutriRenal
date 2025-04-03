import { useState, useEffect } from 'react';
import api from '../../../api';

/**
 * Hook personalizado para manejar la lógica de la pantalla de Alimentos
 */
export default function useAlimentosList() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState('alimentos');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFoods, setCategoryFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para cargar datos según el modo seleccionado
  useEffect(() => {
    setLoading(true);
    const endpoint = mode === 'alimentos' ? '/alimentos/' : '/categorias-alimento/';
    
    api.get(endpoint)
      .then(response => {
        setData(response.data);
        if(mode === 'categorias') setSelectedCategory(null);
        setLoading(false);
      })
      .catch(error => {
        console.error(`Error cargando ${mode}:`, error);
        setError(`No se pudieron cargar los ${mode}`);
        setLoading(false);
      });
  }, [mode]);

  // Efecto para cargar alimentos cuando se selecciona una categoría
  useEffect(() => {
    if(selectedCategory) {
      api.get(`/alimentos/?categoria=${selectedCategory.id}`)
        .then(response => setCategoryFoods(response.data))
        .catch(error => {
          console.error('Error cargando alimentos de categoría:', error);
          setCategoryFoods([]);
        });
    } else {
      setCategoryFoods([]);
    }
  }, [selectedCategory]);

  // Función para obtener color del semáforo nutricional
  const getSemaphoreColor = (nutrient, value) => {
    if (nutrient === 'potasio') {
      if (value > 300) return 'red';
      else if (value >= 151) return 'yellow';
      else return 'green';
    } else if (nutrient === 'sodio') {
      if (value > 600) return 'red';
      else if (value >= 500) return 'yellow';
      else return 'green';
    } else if (nutrient === 'fosforo') {
      if (value > 300) return 'red';
      else if (value >= 91) return 'yellow';
      else return 'green';
    }
    return 'grey';
  };

  // Filtrar datos según la búsqueda
  const filteredData = data.filter(item =>
    item.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    data: filteredData,
    searchQuery,
    setSearchQuery,
    mode,
    setMode,
    selectedCategory,
    setSelectedCategory,
    categoryFoods,
    loading,
    error,
    getSemaphoreColor
  };
}
