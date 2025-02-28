import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../api';

export default function AlimentosCategoriaScreen() {
  const navigation = useNavigation();
  const route: any = useRoute();
  const { categoria } = route.params;
  const [alimentos, setAlimentos] = useState<any[]>([]);
  
  useEffect(() => {
    api.get(`/alimentos/?categoria=${categoria.id}`)
      .then(response => setAlimentos(response.data))
      .catch(error => console.error(error));
  }, [categoria]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('AlimentoDetailScreen', { alimento: item })}>
      <Text style={styles.itemText}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{categoria.nombre}</Text>
      <Text style={styles.subtitle}>Alimentos de esta categoría</Text>
      {alimentos.length > 0 ? (
        <FlatList
          data={alimentos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text>Cargando alimentos...</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ...existing styles...
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  item: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
});
