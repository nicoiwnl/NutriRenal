import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import styles from '../styles/recetasStyles';

const RecetaCard = ({ item, onPress, getRecipeCategories, tipoRecetaMapping }) => {
  const recipeCategories = getRecipeCategories(item);
  
  return (
    <TouchableOpacity 
      style={styles.recetaCard} 
      onPress={() => onPress(item.id)}
    >
      <Card>
        <Card.Cover 
          source={{ 
            uri: item.url_imagen || 'https://via.placeholder.com/300x150?text=Receta'
          }} 
          style={styles.recetaImage}
        />
        <Card.Content>
          <Text style={styles.recetaTitle}>{item.nombre}</Text>
          
          <View style={styles.recetaTags}>
            {recipeCategories.map((category, index) => (
              <Chip 
                key={index}
                icon="tag" 
                mode="outlined" 
                style={styles.categoryTag}
                textStyle={styles.categoryTagText}
              >
                {category}
              </Chip>
            ))}
            <Chip 
              icon="silverware-fork-knife"
              mode="outlined"
              style={styles.typeTag}
              textStyle={styles.typeTagText}
            >
              {item.tipo_receta ? tipoRecetaMapping[item.tipo_receta] : 'Plato principal'}
            </Chip>
          </View>
          <Text style={styles.recetaDescription} numberOfLines={2}>
            {item.preparacion?.substring(0, 100)}...
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

export default RecetaCard;
