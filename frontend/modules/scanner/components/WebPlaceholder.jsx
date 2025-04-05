import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/scannerStyles';

const WebPlaceholder = () => {
  return (
    <View style={styles.webContainer}>
      <Text style={styles.webText}>
        La funcionalidad de captura de imágenes de alimentos no está disponible en la web.
        Por favor, utilice la aplicación móvil para escanear sus alimentos.
      </Text>
    </View>
  );
};

export default WebPlaceholder;
