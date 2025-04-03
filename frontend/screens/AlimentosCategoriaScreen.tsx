import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

// Importar componentes y hooks modularizados
import SearchBar from '../modules/alimentos/components/SearchBar';
import useAlimentosCategoria from '../modules/alimentos/hooks/useAlimentosCategoria';
import styles from '../modules/alimentos/styles/alimentosScreenStyles';

export default function AlimentosCategoriaScreen() {
  const navigation = useNavigation();
  const route: any = useRoute();
  const { categoria } = route.params;
  
  // Usar hook personalizado para la lógica
  const {
    alimentos,
    loading,
    error,
    searchQuery,
    setSearchQuery
  } = useAlimentosCategoria(categoria.id);

  // Renderizar un alimento
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('AlimentoDetailScreen', { alimentoId: item.id })}>
      <Text style={styles.itemText}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  // Renderizar pantalla de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text>Cargando alimentos...</Text>
      </View>
    );
  }

  // Renderizar pantalla de error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#F44336" />
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{categoria.nombre}</Text>
      <Text style={styles.subtitle}>Alimentos de esta categoría</Text>
      
      {/* Barra de búsqueda */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={`Buscar en ${categoria.nombre}...`}
      />
      
      {/* Lista de alimentos */}
      {alimentos.length > 0 ? (
        <FlatList
          data={alimentos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No se encontraron alimentos que coincidan con la búsqueda
            </Text>
          }
        />
      ) : (
        <Text style={styles.emptyText}>No hay alimentos en esta categoría</Text>
      )}
    </SafeAreaView>
  );
}
