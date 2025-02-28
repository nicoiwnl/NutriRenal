import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import api from '../api';
import { useNavigation } from '@react-navigation/native';

export default function ConsejosCategoriaScreen() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    api.get('/consejos-nutricionales/')
      .then(response => {
        const consejos = response.data;
        const categoriasUnicas = [...new Set(consejos.map(c => c.categoria))];
        setCategorias(categoriasUnicas);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setLoading(false);
      });
  }, []);

  const handleCategoryPress = (categoria) => {
    navigation.navigate('ConsejosPorCategoriaScreen', { categoria });
  };

  const renderCategoria = ({ item }) => (
    <TouchableOpacity style={styles.categoriaContainer} onPress={() => handleCategoryPress(item)}>
      <Text style={styles.categoriaText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={categorias}
          renderItem={renderCategoria}
          keyExtractor={item => item}
          contentContainerStyle={styles.list}
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
  list: {
    paddingVertical: 20,
  },
  categoriaContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 3,
  },
  categoriaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
  },
});
