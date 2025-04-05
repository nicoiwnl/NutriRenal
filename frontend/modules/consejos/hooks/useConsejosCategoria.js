import { useState, useEffect } from 'react';
import api from '../../../api';

export default function useConsejosCategoria(navigation) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar categorías desde los consejos
  useEffect(() => {
    setLoading(true);
    api.get('/consejos-nutricionales/')
      .then(response => {
        const consejos = response.data;
        const categoriasUnicas = [...new Set(consejos.map(c => c.categoria))];
        setCategorias(categoriasUnicas);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setError('No se pudieron cargar las categorías');
        setLoading(false);
      });
  }, []);

  // Manejar la selección de una categoría
  const handleCategoryPress = (categoria) => {
    navigation.navigate('ConsejosPorCategoriaScreen', { categoria });
  };

  return {
    categorias,
    loading,
    error,
    handleCategoryPress
  };
}
