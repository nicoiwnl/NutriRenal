import { useState, useEffect } from 'react';
import { Share, Alert, Platform } from 'react-native';
import api from '../../../api';

export default function useRecetaDetail(recetaId, navigation) {
  const [loading, setLoading] = useState(true);
  const [receta, setReceta] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [error, setError] = useState(null);

  // Mapeo de tipos de receta para mostrar
  const tipoRecetaMapping = {
    'entrada': 'Entrada',
    'plato_principal': 'Plato Principal',
    'plato_fondo': 'Plato de Fondo',
    'postres_colaciones': 'Postres y Colaciones'
  };

  useEffect(() => {
    fetchRecetaDetail();
  }, [recetaId]);

  const fetchRecetaDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/recetas/${recetaId}/`);
      setReceta(response.data);
      
      // Obtener ingredientes
      try {
        const ingredientesResponse = await api.get(`/ingredientes-receta/?receta=${recetaId}`);
        setIngredientes(ingredientesResponse.data);
      } catch (ingredientError) {
        console.log('No se pudieron cargar los ingredientes:', ingredientError);
        setIngredientes([]);
      }
    } catch (error) {
      console.error('Error al cargar detalles de la receta:', error);
      setError('No se pudo cargar la receta');
    } finally {
      setLoading(false);
    }
  };

  const shareReceta = async () => {
    if (!receta) return;
    
    try {
      const ingredientesText = ingredientes.length > 0 
        ? '\n\nIngredientes:\n' + ingredientes.map(ing => 
            `- ${ing.cantidad} ${ing.unidad?.nombre || ''} de ${ing.alimento?.nombre || ing.nombre || 'ingrediente'}`
          ).join('\n')
        : '';
        
      const materialesText = receta.materiales 
        ? '\n\nMateriales:\n' + receta.materiales
        : '';
      
      const message = `Receta: ${receta.nombre}\n\n` +
        `Preparación:\n${receta.preparacion}` +
        ingredientesText +
        materialesText;
      
      await Share.share({
        message,
        title: `Receta: ${receta.nombre}`,
      });
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'No se pudo compartir la receta');
    }
  };

  // Obtener categorías que aplican a esta receta
  const getRecipeCategories = () => {
    if (!receta) return [];
    
    const categories = [];
    
    if (receta.bajo_en_sodio) categories.push({ name: 'Bajo en sodio', icon: 'restaurant' });
    if (receta.bajo_en_fosforo) categories.push({ name: 'Bajo en fósforo', icon: 'science' });
    if (receta.bajo_en_potasio) categories.push({ name: 'Bajo en potasio', icon: 'spa' });
    if (receta.bajo_en_proteinas) categories.push({ name: 'Bajo en proteínas', icon: 'fitness-center' });
    
    return categories;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return {
    loading,
    receta,
    ingredientes,
    error,
    tipoRecetaMapping,
    shareReceta,
    getRecipeCategories,
    handleBack,
    refreshReceta: fetchRecetaDetail
  };
}
