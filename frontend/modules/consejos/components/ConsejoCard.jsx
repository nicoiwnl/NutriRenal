import React from 'react';
import { View, Text, Image, Platform } from 'react-native';
import styles from '../styles/consejosStyles';
import categoriaStyles from '../styles/consejosPorCategoriaStyles';
import { BASE_URL } from '../../../config/apiConfig';

const ConsejoCard = ({ item, inCategory = false }) => {
  // Usar estilos diferentes según si está en la pantalla principal o en categoría
  const containerStyle = inCategory 
    ? categoriaStyles.consejoContainer 
    : [styles.consejoContainer, Platform.OS === 'web' && styles.consejoContainerWeb];
  
  const titleStyle = inCategory ? categoriaStyles.title : styles.title;
  const contentStyle = inCategory ? categoriaStyles.content : styles.content;
  const imageStyle = inCategory ? categoriaStyles.image : styles.image;

  return (
    <View style={containerStyle}>
      <Image 
        source={{ uri: `${BASE_URL}${item.url_imagen}` }} 
        style={imageStyle} 
      />
      <Text style={titleStyle}>{item.titulo}</Text>
      <Text style={contentStyle}>{item.contenido}</Text>
    </View>
  );
};

export default ConsejoCard;
