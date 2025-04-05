import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Importar componentes y hooks modularizados
import CategoriaItem from '../modules/consejos/components/CategoriaItem';
import LoadingView from '../modules/consejos/components/LoadingView';
import useConsejosCategoria from '../modules/consejos/hooks/useConsejosCategoria';
import styles from '../modules/consejos/styles/consejosCategoriaStyles';

export default function ConsejosCategoriaScreen() {
  const navigation = useNavigation();
  
  // Usar el hook personalizado para la lógica
  const {
    categorias,
    loading,
    error,
    handleCategoryPress
  } = useConsejosCategoria(navigation);

  // Renderizar pantalla de carga
  if (loading) {
    return <LoadingView message="Cargando categorías..." />;
  }

  // Renderizar mensaje de error si es necesario
  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categorias}
        renderItem={({ item }) => (
          <CategoriaItem 
            item={item} 
            onPress={handleCategoryPress} 
          />
        )}
        keyExtractor={item => item}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
      />
    </View>
  );
}
