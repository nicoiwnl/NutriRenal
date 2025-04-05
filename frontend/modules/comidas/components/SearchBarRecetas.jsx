import React from 'react';
import { View, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/recetasStyles';

const SearchBarRecetas = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar recetas..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <MaterialIcons name="search" size={24} color="#690B22" style={styles.searchIcon} />
    </View>
  );
};

export default SearchBarRecetas;
