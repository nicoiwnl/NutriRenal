import React from 'react';
import { View, FlatList, Text } from 'react-native';

// Importar componentes y hooks modularizados
import ConsejoCard from '../modules/consejos/components/ConsejoCard';
import LoadingView from '../modules/consejos/components/LoadingView';
import useConsejosPorCategoria from '../modules/consejos/hooks/useConsejosPorCategoria';
import styles from '../modules/consejos/styles/consejosPorCategoriaStyles';

export default function ConsejosPorCategoriaScreen({ route }) {
  const { categoria } = route.params;
  
  // Usar el hook personalizado para la lógica
  const {
    consejos,
    loading,
    error
  } = useConsejosPorCategoria(categoria);

  // Renderizar pantalla de carga
  if (loading) {
    return <LoadingView message="Cargando consejos..." />;
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
        data={consejos}
        renderItem={({ item }) => <ConsejoCard item={item} inCategory={true} />}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        initialNumToRender={5}
      />
    </View>
  );
}