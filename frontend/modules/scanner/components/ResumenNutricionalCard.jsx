import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatMinerales } from '../../../utils/formatUtils';

// Create a focused component that only displays the three key minerals
const ResumenNutricionalCard = (props) => {
  console.log("ResumenNutricionalCard rendering with props:", JSON.stringify(props, null, 2));
  
  // Step 1: Handle undefined props completely safely
  if (!props) props = {};
  
  // Step 2: Ensure totales and compatibilidad exist as objects
  const totales = props.totales || {};
  
  // Step 3: Create fully-defined compatibilidad with safe defaults
  const safeCompatibilidad = {
    sodio: { compatible: false, valor: 0 },
    potasio: { compatible: false, valor: 0 },
    fosforo: { compatible: false, valor: 0 }
  };
  
  // More cautious merging of properties
  if (props.compatibilidad) {
    if (props.compatibilidad.sodio) {
      safeCompatibilidad.sodio.compatible = !!props.compatibilidad.sodio.compatible;
      safeCompatibilidad.sodio.valor = Number(props.compatibilidad.sodio.valor || 0);
    }
    
    if (props.compatibilidad.potasio) {
      safeCompatibilidad.potasio.compatible = !!props.compatibilidad.potasio.compatible;
      safeCompatibilidad.potasio.valor = Number(props.compatibilidad.potasio.valor || 0);
    }
    
    if (props.compatibilidad.fosforo) {
      safeCompatibilidad.fosforo.compatible = !!props.compatibilidad.fosforo.compatible;
      safeCompatibilidad.fosforo.valor = Number(props.compatibilidad.fosforo.valor || 0);
    }
  }
  
  // Step 5: Extract all values we need with defaults
  const safeValues = {
    sodio: safeCompatibilidad.sodio.valor,
    potasio: safeCompatibilidad.potasio.valor,
    fosforo: safeCompatibilidad.fosforo.valor
  };
  
  // Track previous values to animate changes
  const [prevValues, setPrevValues] = useState(safeValues);
  
  // Initialize animation hook
  const animatedValue = new Animated.Value(0);
  
  // Use effect for animation and to track value changes
  useEffect(() => {
    // Check if values actually changed to trigger animation
    const hasChanged = 
      safeValues.sodio !== prevValues.sodio || 
      safeValues.potasio !== prevValues.potasio || 
      safeValues.fosforo !== prevValues.fosforo;
    
    if (hasChanged) {
      console.log("Values changed! Animating from:", prevValues, "to:", safeValues);
      setPrevValues(safeValues);
      
      // Only run animation if we're not on web platform and values changed
      if (Platform.OS !== 'web') {
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            delay: 800,
            useNativeDriver: false
          })
        ]).start();
      }
    }
  }, [
    safeValues.sodio,
    safeValues.potasio, 
    safeValues.fosforo,
    props.totales?.sodio,
    props.totales?.potasio,
    props.totales?.fosforo
  ]);
  
  // Animation interpolation
  const highlightBackground = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0)', 'rgba(106, 11, 34, 0.1)']
  });
  
  // Format values for display - MAKE SURE to use values directly from props
  const sodioFormatted = formatMinerales(safeValues.sodio);
  const potasioFormatted = formatMinerales(safeValues.potasio);
  const fosforoFormatted = formatMinerales(safeValues.fosforo);
  
  console.log("Displaying values - Sodio:", sodioFormatted, "Potasio:", potasioFormatted, "Fósforo:", fosforoFormatted);
  
  return (
    <Animated.View style={[styles.card, { backgroundColor: highlightBackground }]}>
      <Text style={styles.cardTitle}>Minerales relevantes en enfermedad renal</Text>
      
      {/* Semáforo de minerales - CRITICAL: always use safeCompatibilidad, never props.compatibilidad */}
      <View style={styles.mineralSection}>
        <View style={styles.mineralItem}>
          <View style={styles.mineralLabelContainer}>
            <Text style={styles.mineralLabel}>Sodio</Text>
          </View>
          <View style={styles.mineralBarContainer}>
            <View 
              style={[
                styles.mineralBar, 
                { 
                  backgroundColor: safeCompatibilidad.sodio.compatible ? '#4CAF50' : '#F44336',
                  width: `${Math.min(100, Math.max(10, safeValues.sodio / 10))}%`
                }
              ]} 
            />
          </View>
          <Text style={styles.mineralValue}>{sodioFormatted}</Text>
        </View>
        
        <View style={styles.mineralItem}>
          <View style={styles.mineralLabelContainer}>
            <Text style={styles.mineralLabel}>Potasio</Text>
          </View>
          <View style={styles.mineralBarContainer}>
            <View 
              style={[
                styles.mineralBar, 
                { 
                  backgroundColor: safeCompatibilidad.potasio.compatible ? '#4CAF50' : '#F44336',
                  width: `${Math.min(100, Math.max(10, safeValues.potasio / 20))}%`
                }
              ]} 
            />
          </View>
          <Text style={styles.mineralValue}>{potasioFormatted}</Text>
        </View>
        
        <View style={styles.mineralItem}>
          <View style={styles.mineralLabelContainer}>
            <Text style={styles.mineralLabel}>Fósforo</Text>
          </View>
          <View style={styles.mineralBarContainer}>
            <View 
              style={[
                styles.mineralBar, 
                { 
                  backgroundColor: safeCompatibilidad.fosforo.compatible ? '#4CAF50' : '#F44336',
                  width: `${Math.min(100, Math.max(10, safeValues.fosforo / 10))}%`
                }
              ]} 
            />
          </View>
          <Text style={styles.mineralValue}>{fosforoFormatted}</Text>
        </View>
      </View>
      
      {/* Legend for values */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#4CAF50'}]}></View>
          <Text style={styles.legendText}>Dentro del límite recomendado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#F44336'}]}></View>
          <Text style={styles.legendText}>Excede el límite recomendado</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 16,
  },
  mineralSection: {
    marginTop: 8,
  },
  mineralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  mineralLabelContainer: {
    width: 60,
  },
  mineralLabel: {
    fontSize: 14,
    color: '#333',
  },
  mineralBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  mineralBar: {
    height: '100%',
    width: '100%',
    borderRadius: 6,
  },
  mineralValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 60,
    textAlign: 'right',
  },
  legendContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  }
});

// Use React.memo to prevent unnecessary re-renders but with a deep comparison function
export default memo(ResumenNutricionalCard, (prevProps, nextProps) => {
  // Custom comparison function to ensure component updates when nutritional values change
  // Return true only if the props should be considered equal (no re-render needed)
  if (!prevProps || !nextProps) return false;
  
  const prevCompatibilidad = prevProps.compatibilidad || {};
  const nextCompatibilidad = nextProps.compatibilidad || {};
  
  // Check if any of the mineral values changed
  const mineralsEqual = 
    prevCompatibilidad.sodio?.valor === nextCompatibilidad.sodio?.valor &&
    prevCompatibilidad.potasio?.valor === nextCompatibilidad.potasio?.valor &&
    prevCompatibilidad.fosforo?.valor === nextCompatibilidad.fosforo?.valor;
  
  return mineralsEqual;
});
