import React from 'react';
import { View } from 'react-native';
import { Chip } from 'react-native-paper';
import styles from '../styles/recetaDetailStyles';

const RecetaCategorias = ({ tipoReceta, categories, tipoRecetaMapping }) => {
  return (
    <View style={styles.categoryContainer}>
      <Chip 
        icon="silverware" 
        mode="outlined"
        style={styles.typeChip}
      >
        {tipoRecetaMapping[tipoReceta] || 'Plato Principal'}
      </Chip>
      
      {categories.map((category, index) => (
        <Chip 
          key={index}
          icon={category.icon}
          mode="outlined"
          style={styles.categoryChip}
        >
          {category.name}
        </Chip>
      ))}
    </View>
  );
};

export default RecetaCategorias;
