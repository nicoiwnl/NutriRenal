import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../api';

export default function RecetasScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [recetas, setRecetas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTipoComida, setSelectedTipoComida] = useState(null); // Nuevo estado para tipo de comida
  
  // Categorías basadas en los campos booleanos del modelo Receta
  const categories = [
    { id: 1, name: 'Todas', icon: 'filter-list' },
    { id: 2, name: 'Bajo en sodio', filterField: 'bajo_en_sodio', icon: 'grain' },
    { id: 3, name: 'Bajo en fósforo', filterField: 'bajo_en_fosforo', icon: 'science' },
    { id: 4, name: 'Bajo en potasio', filterField: 'bajo_en_potasio', icon: 'bolt' },
    { id: 5, name: 'Bajo en proteínas', filterField: 'bajo_en_proteinas', icon: 'fitness-center' },
  ];

  // Add the missing tiposComida array
  const tiposComida = [
    { id: 1, name: 'Todos', value: null },
    { id: 2, name: 'Entrada', value: 'entrada' },
    { id: 3, name: 'Plato Principal', value: 'plato_principal' },
    { id: 4, name: 'Plato de Fondo', value: 'plato_fondo' },
    { id: 5, name: 'Postres y Colaciones', value: 'postres_colaciones' },
  ];

  // Tipos de comida según el modelo para mostrar iconos apropiados
  const tiposComidaIcons = {
    'entrada': 'fastfood',
    'plato_principal': 'restaurant',
    'plato_fondo': 'dinner-dining',
    'postres_colaciones': 'icecream'
  };

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
      // Datos de ejemplo para mostrar interfaz
      setRecetas([
        {
          id: '1',
          nombre: 'Ensalada de pollo con aguacate',
          preparacion: 'Mezcle el pollo desmenuzado con aguacate y vegetales frescos...',
          informacion_nutricional: 'Proteína: 25g, Grasa: 15g, Carbohidratos: 10g',
          imagenes: [{ url_imagen: 'https://example.com/image1.jpg' }],
          categoria: 'Bajo en sodio'
        },
        {
          id: '2',
          nombre: 'Pasta integral con vegetales',
          preparacion: 'Cocine la pasta integral al dente y mezclar con vegetales salteados...',
          informacion_nutricional: 'Proteína: 12g, Grasa: 5g, Carbohidratos: 45g',
          imagenes: [{ url_imagen: 'https://example.com/image2.jpg' }],
          categoria: 'Bajo en potasio'
        },
        {
          id: '3',
          nombre: 'Salmón al horno con limón',
          preparacion: 'Hornee el filete de salmón con rodajas de limón y hierbas...',
          informacion_nutricional: 'Proteína: 30g, Grasa: 18g, Carbohidratos: 0g',
          imagenes: [{ url_imagen: 'https://example.com/image3.jpg' }],
          categoria: 'Sin fósforo'
        },
      ]);
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

  // Helper para obtener el icono apropiado para el tipo de comida
  const getTipoComidaIcon = (tipoReceta) => {
    return tiposComidaIcons[tipoReceta] || 'restaurant-menu';
  };

  const renderRecetaItem = ({ item }) => {
    const recipeCategories = getRecipeCategories(item);
    
    return (
      <TouchableOpacity 
        style={styles.recetaCard} 
        onPress={() => navigation.navigate('RecetaDetail', { recetaId: item.id })}
      >
        <Card>
          <Card.Cover 
            source={{ 
              uri: item.url_imagen || 'https://via.placeholder.com/300x150?text=Receta'
            }} 
            style={styles.recetaImage}
          />
          <Card.Content>
            <Text style={styles.recetaTitle}>{item.nombre}</Text>
            
            <View style={styles.recetaTags}>
              {recipeCategories.map((category, index) => (
                <Chip 
                  key={index}
                  icon="tag" 
                  mode="outlined" 
                  style={styles.categoryTag}
                  textStyle={styles.categoryTagText}
                >
                  {category}
                </Chip>
              ))}
              <Chip 
                icon="silverware-fork-knife"
                mode="outlined"
                style={styles.typeTag}
                textStyle={styles.typeTagText}
              >
                {item.tipo_receta ? tipoRecetaMapping[item.tipo_receta] : 'Plato principal'}
              </Chip>
            </View>
            <Text style={styles.recetaDescription} numberOfLines={2}>
              {item.preparacion?.substring(0, 100)}...
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar recetas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MaterialIcons name="search" size={24} color="#690B22" style={styles.searchIcon} />
      </View>
      
      {/* Filtros por categoría nutricional - sin iconos */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.filterTitle}>Restricciones dietéticas:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(
                selectedCategory === category.name ? null : category.name
              )}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.name && styles.selectedCategoryButtonText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Filtros por tipo de comida */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.filterTitle}>Tipo de comida:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tiposComida.map(tipo => (
            <TouchableOpacity
              key={tipo.id}
              style={[
                styles.typeButton,
                selectedTipoComida === tipo.name && styles.selectedTypeButton
              ]}
              onPress={() => setSelectedTipoComida(
                selectedTipoComida === tipo.name ? null : tipo.name
              )}
            >
              <Text style={[
                styles.typeButtonText,
                selectedTipoComida === tipo.name && styles.selectedTypeButtonText
              ]}>
                {tipo.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#690B22" />
          <Text style={styles.loadingText}>Cargando recetas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecetas}
          keyExtractor={item => item.id.toString()}
          renderItem={renderRecetaItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="no-meals" size={64} color="#690B22" />
              <Text style={styles.emptyText}>No se encontraron recetas</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// Agregar mapeo para mostrar nombres amigables de tipos de comida
const tipoRecetaMapping = {
  'entrada': 'Entrada',
  'plato_principal': 'Plato Principal',
  'plato_fondo': 'Plato de Fondo',
  'postres_colaciones': 'Postres y Colaciones'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 8,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E07A5F',
  },
  selectedCategoryButton: {
    backgroundColor: '#E07A5F',
  },
  categoryButtonText: {
    color: '#1B4D3E',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  recetaCard: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recetaImage: {
    height: 150,
  },
  recetaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginVertical: 8,
  },
  recetaTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#F1E3D3',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 12,
  },
  recetaDescription: {
    color: '#666',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
    color: '#1B4D3E',
  },
  typeTag: {
    backgroundColor: '#E9F5E9',
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#4CAF50',
  },
  typeTagText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginLeft: 16,
    marginBottom: 8,
  },
  typeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedTypeButton: {
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    color: '#1B4D3E',
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  categoryIcon: {
    marginRight: 6,
  },
  tipoComidaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  tipoComidaText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
