import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/consejosCategoriaStyles';

const CategoriaItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.categoriaContainer} 
      onPress={() => onPress(item)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name="article" size={22} color="#690B22" style={{ marginRight: 10 }} />
        <Text style={styles.categoriaText}>{item}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CategoriaItem;
