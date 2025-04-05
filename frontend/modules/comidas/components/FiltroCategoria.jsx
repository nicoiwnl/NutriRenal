import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../styles/recetasStyles';

const FiltroCategoria = ({ title, items, selectedItem, onSelectItem }) => {
  return (
    <View style={styles.categoriesContainer}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              title.includes('Restricciones') ? styles.categoryButton : styles.typeButton,
              selectedItem === item.name && (
                title.includes('Restricciones') ? styles.selectedCategoryButton : styles.selectedTypeButton
              )
            ]}
            onPress={() => onSelectItem(
              selectedItem === item.name ? null : item.name
            )}
          >
            <Text style={[
              title.includes('Restricciones') ? styles.categoryButtonText : styles.typeButtonText,
              selectedItem === item.name && (
                title.includes('Restricciones') ? styles.selectedCategoryButtonText : styles.selectedTypeButtonText
              )
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default FiltroCategoria;
