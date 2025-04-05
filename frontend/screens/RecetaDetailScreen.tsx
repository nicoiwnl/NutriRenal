import React from 'react';
import { View, Image, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Importar componentes y hooks del módulo
import RecetaHeader from '../modules/comidas/components/RecetaHeader';
import RecetaCategorias from '../modules/comidas/components/RecetaCategorias';
import IngredientesList from '../modules/comidas/components/IngredientesList';
import MaterialesSection from '../modules/comidas/components/MaterialesSection';
import PreparacionSection from '../modules/comidas/components/PreparacionSection';
import useRecetaDetail from '../modules/comidas/hooks/useRecetaDetail';
import styles from '../modules/comidas/styles/recetaDetailStyles';

export default function RecetaDetailScreen({ route, navigation }) {
  const { recetaId } = route.params;
  
  // Usar el hook personalizado
  const {
    loading,
    receta,
    ingredientes,
    error,
    tipoRecetaMapping,
    shareReceta,
    getRecipeCategories,
    handleBack
  } = useRecetaDetail(recetaId, navigation);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando receta...</Text>
      </View>
    );
  }

  if (error || !receta) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#690B22" />
        <Text style={styles.errorText}>No se pudo cargar la receta</Text>
        <TouchableOpacity 
          style={styles.buttonContainer}
          onPress={handleBack}
        >
          <Text style={styles.buttonText}>Volver a Recetas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recipeCategories = getRecipeCategories();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image 
          source={{ uri: receta.url_imagen || 'https://via.placeholder.com/400x300?text=Receta' }}
          style={styles.recetaImage}
          resizeMode="cover"
        />
        
        <View style={styles.contentContainer}>
          {/* Header con título y botón de compartir */}
          <RecetaHeader 
            title={receta.nombre} 
            onShare={shareReceta} 
          />
          
          {/* Categorías y tipo de receta */}
          <RecetaCategorias 
            tipoReceta={receta.tipo_receta}
            categories={recipeCategories}
            tipoRecetaMapping={tipoRecetaMapping}
          />
          
          {/* Sección de ingredientes */}
          <IngredientesList ingredientes={ingredientes} />
          
          {/* Sección de materiales si existen */}
          <MaterialesSection materiales={receta.materiales} />
          
          {/* Sección de preparación */}
          <PreparacionSection preparacion={receta.preparacion} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
