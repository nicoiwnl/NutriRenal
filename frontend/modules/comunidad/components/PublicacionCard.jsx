import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getImageUrl } from '../../../utils/imageHelper';
import styles from '../styles/comunidadStyles';

const PublicacionCard = ({ item, onPress }) => {
  const fechaFormateada = new Date(item.fecha_creacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: getImageUrl(item.autor_foto, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }}
              style={styles.authorImage}
              resizeMode="cover"
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{item.autor_nombre || 'Usuario'}</Text>
              <Text style={styles.publicationDate}>{fechaFormateada}</Text>
            </View>
          </View>
          
          <Text style={styles.asunto}>{item.asunto}</Text>
          <Text style={styles.contenido} numberOfLines={3}>
            {item.contenido}
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialIcons name="comment" size={16} color="#666" />
              <Text style={styles.statText}>{item.comentarios_count || 0} comentarios</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

export default PublicacionCard;
