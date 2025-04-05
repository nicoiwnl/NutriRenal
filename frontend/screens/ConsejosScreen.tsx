import React from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Importar componentes y hooks modularizados
import ConsejoCard from '../modules/consejos/components/ConsejoCard';
import ViewMoreButton from '../modules/consejos/components/ViewMoreButton';
import LoadingView from '../modules/consejos/components/LoadingView';
import useConsejos from '../modules/consejos/hooks/useConsejos';
import styles from '../modules/consejos/styles/consejosStyles';

export default function ConsejosScreen() {
  const navigation = useNavigation();
  
  // Usar el hook personalizado para la lógica
  const {
    visibleConsejos,
    loading,
    error,
    handleViewMore
  } = useConsejos(navigation);

  // Renderizar pantalla de carga
  if (loading) {
    return <LoadingView message="Cargando consejos..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleConsejos}
        renderItem={({ item }) => <ConsejoCard item={item} />}
        keyExtractor={item => item.id.toString()}
      />
      <ViewMoreButton onPress={handleViewMore} />
    </View>
  );
}