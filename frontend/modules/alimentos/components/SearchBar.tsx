import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder = "Buscar..." }) => {
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
      <MaterialIcons name="search" size={20} color="#690B22" style={styles.searchIcon} />
    </View>
  );
};

const styles = StyleSheet.create({
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
      paddingRight: 40,
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
});

export default SearchBar;
