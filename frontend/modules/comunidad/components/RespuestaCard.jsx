import React from 'react';
import { View, Text, Image } from 'react-native';
import { getImageUrl } from '../../../utils/imageHelper';
import styles from '../styles/publicacionDetailStyles';

const RespuestaCard = ({ respuesta, formatDate }) => {
  return (
    <View style={styles.replyItem}>
      <View style={styles.replyHeader}>
        <Image
          source={{ uri: getImageUrl(respuesta.autor_foto, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }}
          style={styles.replyAuthorImage}
          resizeMode="cover"
        />
        <View>
          <Text style={styles.replyAuthorName}>{respuesta.autor_nombre || 'Usuario'}</Text>
          <Text style={styles.replyDate}>{formatDate(respuesta.fecha_creacion)}</Text>
        </View>
      </View>
      <Text style={styles.replyContent}>{respuesta.contenido}</Text>
    </View>
  );
};

export default RespuestaCard;
