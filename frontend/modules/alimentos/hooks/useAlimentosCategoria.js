import { useState, useEffect } from 'react';
import api from '../../../api';

/**
 * Hook personalizado para manejar la lógica de la pantalla de Categoría de Alimentos
 */
export default function useAlimentosCategoria(categoriaId) {
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Efecto para cargar alimentos de la categoría
  useEffect(() => {
    if (!categoriaId) return;
    
    setLoading(true);
    api.get(`/alimentos/?categoria=${categoriaId}`)
      .then(response => {
        setAlimentos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al cargar alimentos de la categoría:', error);
        setError('No se pudieron cargar los alimentos de esta categoría');
        setLoading(false);
      });
  }, [categoriaId]);

  // Filtrar alimentos según la búsqueda
  const filteredAlimentos = alimentos.filter(item =>
    item.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    alimentos: filteredAlimentos,
    loading,
    error,
    searchQuery,
    setSearchQuery
  };
}
