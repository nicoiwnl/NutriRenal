// No utilizado en el código actual, pero se mantiene para referencia futura
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/minutaStyles';
import { getImageUrl } from '../../../config/apiConfig';

const MealGroup = ({ title, items, onItemPress }) => {
  return (
    <View style={styles.mealGroup}>
      <Text style={styles.mealHeader}>{title}</Text>
      
      {items.map(item => (
        <TouchableOpacity 
          key={item.id} 
          style={styles.mealItemCard}
          onPress={() => onItemPress(item)}
        >
          <View style={styles.mealItemContent}>
            {item.image ? (
              <Image 
                source={{ 
                  uri: getImageUrl(item.image)
                }}
                style={styles.mealItemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.mealItemNoImage}>
                <MaterialIcons name="image-not-supported" size={24} color="#ccc" />
              </View>
            )}
            
            <View style={styles.mealItemDetails}>
              <Text style={styles.mealItemName}>{item.name}</Text>
              <Text style={styles.mealItemDesc} numberOfLines={2}>{item.desc}</Text>
              <View style={styles.mealItemActionRow}>
                <MaterialIcons name="visibility" size={16} color="#690B22" />
                <Text style={styles.mealItemActionText}>Ver detalles</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default MealGroup;
