import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importar componentes y hooks del módulo
import SearchBarRecetas from '../modules/comidas/components/SearchBarRecetas';
import FiltroCategoria from '../modules/comidas/components/FiltroCategoria';
import RecetaCard from '../modules/comidas/components/RecetaCard';
import EmptyRecetas from '../modules/comidas/components/EmptyRecetas';
import useRecetas from '../modules/comidas/hooks/useRecetas';
import styles from '../modules/comidas/styles/recetasStyles';

export default function RecetasScreen({ navigation }) {
  // Usar el hook personalizado
  const {
    loading,
    recetas,
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
    handleRecetaPress
  } = useRecetas(navigation);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de búsqueda */}
      <SearchBarRecetas 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      {/* Filtros por categoría nutricional */}
      <FiltroCategoria 
        title="Restricciones dietéticas:"
        items={categories}
        selectedItem={selectedCategory}
        onSelectItem={setSelectedCategory}
      />
      
      {/* Filtros por tipo de comida */}
      <FiltroCategoria 
        title="Tipo de comida:"
        items={tiposComida}
        selectedItem={selectedTipoComida}
        onSelectItem={setSelectedTipoComida}
      />
      
      {/* Lista de recetas */}
      <FlatList
        data={recetas}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <RecetaCard 
            item={item} 
            onPress={handleRecetaPress}
            getRecipeCategories={getRecipeCategories}
            tipoRecetaMapping={tipoRecetaMapping}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<EmptyRecetas />}
      />
    </SafeAreaView>
  );
}
