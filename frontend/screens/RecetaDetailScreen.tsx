import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Share
} from 'react-native';
import { Card, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../api';

export default function RecetaDetailScreen({ route, navigation }) {
  const { recetaId } = route.params;
  const [loading, setLoading] = useState(true);
  const [receta, setReceta] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);

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
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando receta...</Text>
      </View>
    );
  }

  if (!receta) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#690B22" />
        <Text style={styles.errorText}>No se pudo cargar la receta</Text>
        <TouchableOpacity 
          style={styles.buttonContainer}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Volver a Recetas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Obtener categorías que aplican a esta receta
  const getRecipeCategories = () => {
    const categories = [];
    
    if (receta.bajo_en_sodio) categories.push({ name: 'Bajo en sodio', icon: 'restaurant' });
    if (receta.bajo_en_fosforo) categories.push({ name: 'Bajo en fósforo', icon: 'science' });
    if (receta.bajo_en_potasio) categories.push({ name: 'Bajo en potasio', icon: 'spa' });
    if (receta.bajo_en_proteinas) categories.push({ name: 'Bajo en proteínas', icon: 'fitness-center' });
    
    return categories;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image 
          source={{ uri: receta.url_imagen || 'https://via.placeholder.com/400x300?text=Receta' }}
          style={styles.recetaImage}
          resizeMode="cover"
        />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.recetaTitle}>{receta.nombre}</Text>
            
            <TouchableOpacity onPress={shareReceta} style={styles.shareButton}>
              <MaterialIcons name="share" size={24} color="#690B22" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoryContainer}>
            <Chip 
              icon="silverware" 
              mode="outlined"
              style={styles.typeChip}
            >
              {tipoRecetaMapping[receta.tipo_receta] || 'Plato Principal'}
            </Chip>
            
            {getRecipeCategories().map((category, index) => (
              <Chip 
                key={index}
                icon={category.icon}
                mode="outlined"
                style={styles.categoryChip}
              >
                {category.name}
              </Chip>
            ))}
          </View>
          
          {ingredientes.length > 0 && (
            <Card style={styles.sectionCard}>
              <Card.Title title="Ingredientes" left={(props) => <MaterialIcons name="restaurant" size={24} color="#690B22" />} />
              <Card.Content>
                {ingredientes.map((ingrediente, index) => (
                  <View key={index} style={styles.ingredienteItem}>
                    <Text style={styles.ingredienteText}>
                      • {ingrediente.cantidad} {ingrediente.unidad?.nombre || ''} de {ingrediente.alimento?.nombre || ingrediente.nombre || 'ingrediente'}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
          {receta.materiales && (
            <Card style={styles.sectionCard}>
              <Card.Title title="Materiales" left={(props) => <MaterialIcons name="kitchen" size={24} color="#690B22" />} />
              <Card.Content>
                <Text style={styles.materialesText}>{receta.materiales}</Text>
              </Card.Content>
            </Card>
          )}
          <Card style={styles.sectionCard}>
            <Card.Title title="Preparación" left={(props) => <MaterialIcons name="menu-book" size={24} color="#690B22" />} />
            <Card.Content>
              <Text style={styles.preparacionText}>{receta.preparacion}</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E8D8',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8E8D8',
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    backgroundColor: '#690B22',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recetaImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E0E0E0',
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recetaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D3E',
    flex: 1,
  },
  shareButton: {
    padding: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeChip: {
    backgroundColor: '#E9F5E9',
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#4CAF50',
  },
  categoryChip: {
    backgroundColor: '#F1E3D3',
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#E07A5F',
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  ingredienteItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ingredienteText: {
    fontSize: 16,
    color: '#333',
  },
  preparacionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  materialesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});
