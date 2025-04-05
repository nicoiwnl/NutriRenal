import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../styles/consejosStyles';

const ViewMoreButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Ver más Consejos</Text>
    </TouchableOpacity>
  );
};

export default ViewMoreButton;
