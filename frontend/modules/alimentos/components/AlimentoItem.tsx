import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';

interface AlimentoItemProps {
  item: any;
  onPress: () => void;
  getSemaphoreColor: (nutrient: string, value: number) => string;
}

const AlimentoItem: React.FC<AlimentoItemProps> = ({ item, onPress, getSemaphoreColor }) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.mainInfo}>
        <Text style={styles.itemText}>{item.nombre}</Text>
        {item.categoria && typeof item.categoria === 'object' && (
          <Text style={styles.categoriaText}>{item.categoria.nombre}</Text>
        )}
      </View>
      
      <View style={styles.nutrientIndicators}>
        <View style={[styles.indicator, { backgroundColor: getSemaphoreColor('sodio', item.sodio || 0) }]}>
          <Text style={styles.indicatorText}>Na</Text>
        </View>
        <View style={[styles.indicator, { backgroundColor: getSemaphoreColor('potasio', item.potasio || 0) }]}>
          <Text style={styles.indicatorText}>K</Text>
        </View>
        <View style={[styles.indicator, { backgroundColor: getSemaphoreColor('fosforo', item.fosforo || 0) }]}>
          <Text style={styles.indicatorText}>P</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoriaText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  nutrientIndicators: {
    flexDirection: 'row',
  },
  indicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  indicatorText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default AlimentoItem;
