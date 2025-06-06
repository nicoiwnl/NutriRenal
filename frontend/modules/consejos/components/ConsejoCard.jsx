import React from 'react';
import { View, Text, Image, Platform } from 'react-native';
import styles from '../styles/consejosStyles';
import categoriaStyles from '../styles/consejosPorCategoriaStyles';

const ConsejoCard = ({ item, inCategory = false }) => {
  // URL base para las imágenes según la plataforma
  const BASE_URL = Platform.OS === 'web' 
    ? 'http://127.0.0.1:8000' 
    : 'http://192.168.1.24:8000'; // Ajustar según la configuración de tu API

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
