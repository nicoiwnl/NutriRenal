import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const BackButton = ({ onPress, style = {} }) => {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <MaterialIcons name="arrow-back" size={28} color="#690B22" />
    </TouchableOpacity>
  );
};

export default BackButton;
