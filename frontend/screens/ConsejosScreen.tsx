import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import api from '../api';
import { useNavigation } from '@react-navigation/native';

export default function ConsejosScreen() {
  const [consejos, setConsejos] = useState([]);
  const [visibleConsejos, setVisibleConsejos] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    api.get('/consejos-nutricionales/')
      .then(response => {
        console.log('Fetched consejos:', response.data);
        setConsejos(response.data);
        setVisibleConsejos(getRandomConsejos(response.data, 1));
      })
      .catch(error => console.error('Error fetching consejos:', error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleConsejos(getRandomConsejos(consejos, 1));
    }, 30000); // Change consejo every 30 seconds
    return () => clearInterval(interval);
  }, [consejos]);

  const getRandomConsejos = (consejos, count) => {
    const shuffled = [...consejos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleViewMore = () => {
    navigation.getParent()?.navigate('ConsejosCategoriaScreen');
  };

  const BASE_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://192.168.0.4:8000'; // Cambiar por la IP local de tu máquina

  const renderConsejo = ({ item }) => (
      <View style={[styles.consejoContainer, Platform.OS === 'web' && styles.consejoContainerWeb]}>
          <Image source={{ uri: `${BASE_URL}${item.url_imagen}` }} style={styles.image} />
          <Text style={styles.title}>{item.titulo}</Text>
          <Text style={styles.content}>{item.contenido}</Text>
      </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleConsejos}
        renderItem={renderConsejo}
        keyExtractor={item => item.id.toString()}
      />
      <TouchableOpacity style={styles.button} onPress={handleViewMore}>
        <Text style={styles.buttonText}>Ver más Consejos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 20,
  },
  consejoContainer: {
    marginRight: 20,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4,
    marginHorizontal: 10,
  },
  consejoContainerWeb: {
    width: 500,
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
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'justify',
  },
  button: {
    marginBottom: 28, 
    backgroundColor: '#690B22',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});