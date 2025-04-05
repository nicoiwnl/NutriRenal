import { useState, useEffect } from 'react';
import api from '../../../api';

export default function useConsejos(navigation) {
  const [consejos, setConsejos] = useState([]);
  const [visibleConsejos, setVisibleConsejos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar consejos al inicio
  useEffect(() => {
    setLoading(true);
    api.get('/consejos-nutricionales/')
      .then(response => {
        console.log('Fetched consejos:', response.data);
        setConsejos(response.data);
        setVisibleConsejos(getRandomConsejos(response.data, 1));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching consejos:', error);
        setError('No se pudieron cargar los consejos');
        setLoading(false);
      });
  }, []);

  // Cambiar consejo visible cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleConsejos(getRandomConsejos(consejos, 1));
    }, 30000); // Change consejo every 30 seconds
    
    return () => clearInterval(interval);
  }, [consejos]);

  // Obtener consejos aleatorios de la lista
  const getRandomConsejos = (consejos, count) => {
    if (!consejos || consejos.length === 0) return [];
    const shuffled = [...consejos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Manejar la navegación al botón "Ver más"
  const handleViewMore = () => {
    navigation.getParent()?.navigate('ConsejosCategoriaScreen');
  };

  return {
    consejos,
    visibleConsejos,
    loading,
    error,
    handleViewMore
  };
}
