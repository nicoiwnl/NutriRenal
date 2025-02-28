import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../api';

export const options = {
  title: 'Alimentos'
};

export default function AlimentosScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'alimentos' | 'categorias'>('alimentos');
  
  // En modo "categorias", cada item se mostrará de forma expandible.
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryFoods, setCategoryFoods] = useState<any[]>([]);

  useEffect(() => {
    const endpoint = mode === 'alimentos' ? '/alimentos/' : '/categorias-alimento/';
    api.get(endpoint)
      .then(response => {
        setData(response.data);
        if(mode === 'categorias') setSelectedCategory(null);
      })
      .catch(error => console.error(error));
  }, [mode]);

  // Carga los alimentos cuando se selecciona una categoría
  useEffect(() => {
    if(selectedCategory) {
      api.get(`/alimentos/?categoria=${selectedCategory.id}`)
        .then(response => setCategoryFoods(response.data))
        .catch(error => console.error(error));
    } else {
      setCategoryFoods([]);
    }
  }, [selectedCategory]);

  const getSemaphoreColor = (nutrient: string, value: number): string => {
    if (nutrient === 'potasio') {
      if (value > 300) return 'red';
      else if (value >= 151) return 'yellow';
      else return 'green';
    } else if (nutrient === 'sodio') {
      if (value > 600) return 'red';
      else if (value >= 500) return 'yellow';
      else return 'green';
    } else if (nutrient === 'fosforo') {
      if (value > 300) return 'red';
      else if (value >= 91) return 'yellow';
      else return 'green';
    }
    return 'grey';
  };

  const filteredData = data.filter(item =>
    item.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // En modo alimentos, cada item lleva a detalle; en modo categorías, se expande inline.
  const renderItem = ({ item }: { item: any }) => {
    if(mode === 'alimentos'){
      return (
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('AlimentoDetailScreen', { alimento: item })}>
          <Text style={styles.itemText}>{item.nombre}</Text>
        </TouchableOpacity>
      );
    } else { // modo "categorias"
      return (
        <View>
          <TouchableOpacity
            style={styles.item}
            onPress={() => 
              setSelectedCategory(prev => (prev && prev.id === item.id ? null : item))
            }>
            <Text style={styles.itemText}>{item.nombre}</Text>
          </TouchableOpacity>
          {selectedCategory && selectedCategory.id === item.id && (
            <View style={styles.expandedContainer}>
              {categoryFoods.length > 0 ? (
                categoryFoods.map(food => (
                  <TouchableOpacity
                    key={food.id}
                    style={styles.childItem}
                    onPress={() => navigation.navigate('AlimentoDetailScreen', { alimento: food })}>
                    <Text style={styles.childText}>{food.nombre}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.childText}>Cargando alimentos...</Text>
              )}
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar alimento..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MaterialIcons name="search" size={20} color="#690B22" style={styles.searchIcon} />
        {Platform.OS === 'web' && (
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity 
              onPress={() => setMode('alimentos')} 
              style={[styles.toggleButton, mode === 'alimentos' && styles.selectedButton]}>
              <Text style={[styles.toggleText, mode === 'alimentos' && styles.selectedText]}>
                Alimentos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setMode('categorias')} 
              style={[styles.toggleButton, mode === 'categorias' && styles.selectedButton]}>
              <Text style={[styles.toggleText, mode === 'categorias' && styles.selectedText]}>
                Categorías
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {Platform.OS !== 'web' && (
        <View style={styles.modeToggle}>
          <TouchableOpacity 
            onPress={() => setMode('alimentos')} 
            style={[styles.toggleButton, mode === 'alimentos' && styles.selectedButton]}>
            <Text style={[styles.toggleText, mode === 'alimentos' && styles.selectedText]}>
              Alimentos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setMode('categorias')} 
            style={[styles.toggleButton, mode === 'categorias' && styles.selectedButton]}>
            <Text style={[styles.toggleText, mode === 'categorias' && styles.selectedText]}>
              Categorías
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.infoText}>Valores por 100 ml/gr</Text>
      {filteredData.length > 0 ? (
        <FlatList 
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text>Cargando {mode === 'alimentos' ? 'alimentos' : 'categorías'}...</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    padding: 20,
  },
  searchBarContainer: Platform.select({
    web: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      position: 'relative',
    },
    default: {
      marginBottom: 10,
    }
  }),
  searchInput: Platform.select({
    web: {
      flex: 1,
      backgroundColor: '#fff',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 8,
      fontSize: 14,
      paddingRight: 40, // espacio para el ícono de lupa
    },
    default: {
      backgroundColor: '#fff',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 8,
      fontSize: 16,
    }
  }),
  searchIcon: Platform.select({
    web: {
      position: 'absolute',
      right: 10,
      pointerEvents: 'none',
    },
    default: {
      display: 'none',
    }
  }),
  modeToggleContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  modeToggle: Platform.select({
    web: {
      // En web se coloca junto al searchBarContainer
    },
    default: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: 10,
    }
  }),
  toggleButton: Platform.select({
    web: {
      width: '48%', // ajuste para evitar sobresalir
      paddingVertical: 6, // Aumentado de 10 a 14
      paddingHorizontal: 8, // Agregado para mayor margen interno
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#690B22',
      marginLeft: 5,
    },
    default: {
      flex: 1,
      paddingVertical: 6,
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#690B22',
    }
  }),
  selectedButton: {
    backgroundColor: '#690B22',
  },
  toggleText: {
    fontSize: Platform.select({ web: 14, default: 16 }),
    color: '#690B22',
    paddingHorizontal: 4, // espacio adicional entre el texto y el borde
  },
  selectedText: {
    color: '#F1E3D3',
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
    fontStyle: 'italic',
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
  expandedContainer: {
    backgroundColor: '#F1E3D3',
    borderRadius: 8,
    marginLeft: 15,
    marginBottom: 10,
    padding: 8,
  },
  childItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 5,
  },
  childText: {
    fontSize: 16,
    color: '#333',
  },
  // ...otros estilos existentes...
});