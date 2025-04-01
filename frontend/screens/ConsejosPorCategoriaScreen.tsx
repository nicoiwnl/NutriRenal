import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Platform } from 'react-native';
import api from '../api';

export default function ConsejosPorCategoriaScreen({ route }) {
  const { categoria } = route.params;
  const [consejos, setConsejos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/consejos-nutricionales/')
      .then(response => {
        const cat = categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const filtered = response.data.filter(item => {
          const itemCat = item.categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return itemCat === cat;
        });
        setConsejos(filtered);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching consejos:', error);
        setLoading(false);
      });
  }, [categoria]);

  const BASE_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://192.168.1.18:8000'; // Cambiar por la IP local de tu máquina

  const renderConsejo = ({ item }) => (
    <View style={styles.consejoContainer}>
      <Image source={{ uri: `${BASE_URL}${item.url_imagen}` }} style={styles.image} />
      <Text style={styles.title}>{item.titulo}</Text>
      <Text style={styles.content}>{item.contenido}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={consejos}
          renderItem={renderConsejo}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 20,
  },
  list: {
    paddingVertical: 20,
    width: '100%',
  },
  consejoContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 3,
    width: '90%',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    marginVertical: 10,
  },
  content: {
    fontSize: 16,
    color: '#1B4D3E',
  },
});