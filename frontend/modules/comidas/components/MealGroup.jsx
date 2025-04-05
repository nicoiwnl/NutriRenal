import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/minutaStyles';

const MealGroup = ({ title, items }) => {
  return (
    <View style={styles.mealGroup}>
      <Text style={styles.mealHeader}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.mealItem}>
          <Text style={styles.mealItemName}>• {item.name}</Text>
          <Text style={styles.mealItemDesc}>{item.desc}</Text>
        </View>
      ))}
    </View>
  );
};

export default MealGroup;
