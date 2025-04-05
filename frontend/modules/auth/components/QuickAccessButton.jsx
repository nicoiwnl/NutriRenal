import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/homeStyles';

const QuickAccessButton = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <MaterialIcons name={icon} size={32} color="#690B22" />
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default QuickAccessButton;
