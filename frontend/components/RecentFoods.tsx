import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const RecentFoods = ({ foods, onFoodPress }) => {
  // Function to format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Render each food item
  const renderFoodItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => onFoodPress && onFoodPress(item)}
        style={styles.foodItem}
      >
        <Card style={styles.foodCard}>
          <Card.Content>
            <Text style={styles.foodName}>{item.nombre || 'Alimento sin nombre'}</Text>
            
            <View style={styles.nutritionRow}>
              {/* Mostrar calorías primero */}
              <Chip 
                icon="fire" 
                style={styles.nutritionChip}
                textStyle={styles.chipText}
              >
                {Math.round(parseFloat(item.energia) || 0)} kcal
              </Chip>
              
              {/* Cambiar a mostrar fósforo en lugar de categoría */}
              <Chip 
                icon="molecule" 
                style={styles.nutritionChip}
                textStyle={styles.chipText}
              >
                P: {Math.round(parseFloat(item.fosforo) || 0)} mg
              </Chip>
              
              {/* Mostrar sodio último */}
              <Chip 
                icon="water" 
                style={styles.nutritionChip}
                textStyle={styles.chipText}
              >
                Na: {Math.round(parseFloat(item.sodio) || 0)} mg
              </Chip>
            </View>
            
            <Text style={styles.consumptionDate}>
              {item.fecha_consumo ? formatDate(item.fecha_consumo) : 'Fecha desconocida'}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Alimentos Recientes</Text>
          <TouchableOpacity>
            <MaterialIcons name="more-horiz" size={24} color="#690B22" />
          </TouchableOpacity>
        </View>
        
        {foods && foods.length > 0 ? (
          <FlatList
            data={foods}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="no-food" size={48} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>No hay registros recientes</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  foodItem: {
    marginBottom: 10,
  },
  foodCard: {
    backgroundColor: '#F8F8F8',
    elevation: 2,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  nutritionChip: {
    backgroundColor: '#F1E3D3',
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 12,
  },
  consumptionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
});

export default RecentFoods;
