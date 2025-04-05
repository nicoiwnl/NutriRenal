import { useState, useEffect } from 'react';
import api from '../../../api';
import { Alert } from 'react-native';

export default function useRecetas(navigation) {
  const [loading, setLoading] = useState(true);
  const [recetas, setRecetas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTipoComida, setSelectedTipoComida] = useState(null);
  
  // Categorías basadas en los campos booleanos del modelo Receta
  const categories = [
    { id: 1, name: 'Todas', icon: 'filter-list' },
    { id: 2, name: 'Bajo en sodio', filterField: 'bajo_en_sodio', icon: 'grain' },
    { id: 3, name: 'Bajo en fósforo', filterField: 'bajo_en_fosforo', icon: 'science' },
    { id: 4, name: 'Bajo en potasio', filterField: 'bajo_en_potasio', icon: 'bolt' },
    { id: 5, name: 'Bajo en proteínas', filterField: 'bajo_en_proteinas', icon: 'fitness-center' },
  ];

  // Tipos de comida
  const tiposComida = [
    { id: 1, name: 'Todos', value: null },
    { id: 2, name: 'Entrada', value: 'entrada' },
    { id: 3, name: 'Plato Principal', value: 'plato_principal' },
    { id: 4, name: 'Plato de Fondo', value: 'plato_fondo' },
    { id: 5, name: 'Postres y Colaciones', value: 'postres_colaciones' },
  ];

  // Mapeo para mostrar nombres amigables de tipos de comida
  const tipoRecetaMapping = {
    'entrada': 'Entrada',
    'plato_principal': 'Plato Principal',
    'plato_fondo': 'Plato de Fondo',
    'postres_colaciones': 'Postres y Colaciones'
  };

  // Tipos de comida según el modelo para mostrar iconos apropiados
  const tiposComidaIcons = {
    'entrada': 'fastfood',
    'plato_principal': 'restaurant',
    'plato_fondo': 'dinner-dining',
    'postres_colaciones': 'icecream'
  };

  // Cargar recetas al iniciar
  useEffect(() => {
    fetchRecetas();
  }, []);
  
  const fetchRecetas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recetas/');
      setRecetas(response.data);
    } catch (error) {
      console.error('Error al cargar recetas:', error);
      Alert.alert('Error', 'No se pudieron cargar las recetas. Por favor, inténtelo nuevamente.');
      // Establecer datos de ejemplo para mostrar interfaz en desarrollo
      setRecetas([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar recetas según búsqueda, categoría y tipo de comida seleccionados
  const filteredRecetas = recetas.filter(receta => {
    // Filtrar por término de búsqueda
    const matchesSearch = receta?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    
    // Filtrar por categoría nutricional
    let matchesCategory = true;
    if (selectedCategory && selectedCategory !== 'Todas') {
      const categoryObj = categories.find(cat => cat.name === selectedCategory);
      if (categoryObj && categoryObj.filterField) {
        matchesCategory = receta[categoryObj.filterField] === true;
      }
    }
    
    // Filtrar por tipo de comida
    let matchesTipoComida = true;
    if (selectedTipoComida && selectedTipoComida !== 'Todos') {
      const tipoObj = tiposComida.find(tipo => tipo.name === selectedTipoComida);
      if (tipoObj && tipoObj.value) {
        matchesTipoComida = receta.tipo_receta === tipoObj.value;
      }
    }
    
    // La receta debe cumplir todos los criterios
    return matchesSearch && matchesCategory && matchesTipoComida;
  });

  // Obtener las categorías que aplican a una receta
  const getRecipeCategories = (receta) => {
    const applied = [];
    
    if (receta.bajo_en_sodio) applied.push('Bajo en sodio');
    if (receta.bajo_en_fosforo) applied.push('Bajo en fósforo');
    if (receta.bajo_en_potasio) applied.push('Bajo en potasio');
    if (receta.bajo_en_proteinas) applied.push('Bajo en proteínas');
    
    return applied.length > 0 ? applied : ['General'];
  };

  // Navegar al detalle de una receta
  const handleRecetaPress = (recetaId) => {
    navigation.navigate('RecetaDetail', { recetaId });
  };

  // Helper para obtener el icono apropiado para el tipo de comida
  const getTipoComidaIcon = (tipoReceta) => {
    return tiposComidaIcons[tipoReceta] || 'restaurant-menu';
  };

  return {
    loading,
    recetas: filteredRecetas,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTipoComida,
    setSelectedTipoComida,
    categories,
    tiposComida,
    tipoRecetaMapping,
    getRecipeCategories,
    handleRecetaPress,
    getTipoComidaIcon,
    refreshRecetas: fetchRecetas
  };
}
