import { useState, useEffect } from 'react';
import api from '../../../api';

export default function useConsejosPorCategoria(categoria) {
  const [consejos, setConsejos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar consejos filtrados por categoría
  useEffect(() => {
    if (!categoria) {
      setError('Categoría no especificada');
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get('/consejos-nutricionales/')
      .then(response => {
        const cat = categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const filtered = response.data.filter(item => {
          const itemCat = item.categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return itemCat === cat;
        });
        
        if (filtered.length === 0) {
          setError('No hay consejos en esta categoría');
        }
        
        setConsejos(filtered);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching consejos:', error);
        setError('Error al cargar los consejos');
        setLoading(false);
      });
  }, [categoria]);

  return {
    consejos,
    loading,
    error
  };
}
