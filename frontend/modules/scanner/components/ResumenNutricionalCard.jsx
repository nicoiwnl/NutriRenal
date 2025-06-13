import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatMinerales } from '../../../utils/formatUtils';

// Define new threshold constants for visual consistency
const THRESHOLDS = {
  SODIO: 375,    // Actualizado de 800 a 375
  POTASIO: 500,  // Actualizado de 1000 a 500
  FOSFORO: 250   // Actualizado de 700 a 250
};

// Define warning thresholds (middle values) for yellow indicator
const WARNING_THRESHOLDS = {
  SODIO: THRESHOLDS.SODIO / 2,    // 187.5
  POTASIO: THRESHOLDS.POTASIO / 2, // 250
  FOSFORO: THRESHOLDS.FOSFORO / 2  // 125
};

// Create a focused component that only displays the three key minerals
const ResumenNutricionalCard = (props) => {
  // Remove excessive logging
  // console.log("ResumenNutricionalCard rendering with props:", JSON.stringify(props, null, 2));
  
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
      // Remove excessive logging
      // console.log("Values changed! Animating from:", prevValues, "to:", safeValues);
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
  
  // Remove excessive logging
  // console.log("Displaying values - Sodio:", sodioFormatted, "Potasio:", potasioFormatted, "Fósforo:", fosforoFormatted);
  
  // Determine mineral status (0: good, 1: warning, 2: exceeded)
  const getMineralStatus = (mineral, value) => {
    if (mineral === 'sodio') {
      if (value < WARNING_THRESHOLDS.SODIO) return 0; // Good - Green
      if (value < THRESHOLDS.SODIO) return 1;         // Warning - Yellow
      return 2;                                       // Exceeded - Red
    }
    else if (mineral === 'potasio') {
      if (value < WARNING_THRESHOLDS.POTASIO) return 0;
      if (value < THRESHOLDS.POTASIO) return 1;
      return 2;
    }
    else if (mineral === 'fosforo') {
      if (value < WARNING_THRESHOLDS.FOSFORO) return 0;
      if (value < THRESHOLDS.FOSFORO) return 1;
      return 2;
    }
    return 0;
  };
  
  // Get color for mineral status
  const getMineralColor = (status) => {
    switch(status) {
      case 0: return '#4CAF50'; // Green
      case 1: return '#FFC107'; // Yellow
      case 2: return '#F44336'; // Red
      default: return '#4CAF50';
    }
  };
  
  // Determine data source type
  const esEstimacionIA = props.fuenteValores === 'estimacion_ia';
  
  // Calculate status for each mineral
  const sodioStatus = getMineralStatus('sodio', safeValues.sodio);
  const potasioStatus = getMineralStatus('potasio', safeValues.potasio);
  const fosforoStatus = getMineralStatus('fosforo', safeValues.fosforo);
  
  return (
    <Animated.View style={[
      styles.card, 
      { backgroundColor: highlightBackground }
    ]}>
      <View style={styles.headerContainer}>
        {/* Title now occupies its own row at top */}
        <Text style={styles.cardTitle}>Minerales relevantes en enfermedad renal</Text>
      </View>
      
      {/* Source badge now in its own container below title */}
      <View style={styles.sourceContainer}>
        <View style={[
          styles.sourceBadge,
          esEstimacionIA ? styles.iaBadge : styles.realBadge
        ]}>
          <MaterialIcons 
            name={esEstimacionIA ? "psychology" : "verified"} 
            size={14} 
            color={esEstimacionIA ? "#FF6D00" : "#388E3C"} 
          />
          <Text style={[
            styles.sourceText,
            esEstimacionIA ? styles.iaText : styles.realText
          ]}>
            {esEstimacionIA ? "Inteligencia Artificial" : "Base de datos"}
          </Text>
        </View>
      </View>
      
      {/* Semáforo de minerales - ACTUALIZADO con nuevos límites y colores */}
      <View style={styles.mineralSection}>
        <View style={styles.mineralItem}>
          <View style={styles.mineralLabelContainer}>
            <Text style={styles.mineralLabel}>Sodio</Text>
            <Text style={styles.mineralLimit}>Límite: {THRESHOLDS.SODIO}mg</Text>
          </View>
          <View style={styles.mineralBarContainer}>
            <View 
              style={[
                styles.mineralBar, 
                { 
                  backgroundColor: getMineralColor(sodioStatus),
                  width: `${Math.min(100, Math.max(10, safeValues.sodio / (THRESHOLDS.SODIO * 1.5) * 100))}%`
                }
              ]} 
            />
          </View>
          <Text style={[
            styles.mineralValue,
            sodioStatus === 2 ? styles.mineralValueExceeded : 
            sodioStatus === 1 ? styles.mineralValueWarning : {}
          ]}>
            {sodioFormatted}
          </Text>
        </View>
        
        <View style={styles.mineralItem}>
          <View style={styles.mineralLabelContainer}>
            <Text style={styles.mineralLabel}>Potasio</Text>
            <Text style={styles.mineralLimit}>Límite: {THRESHOLDS.POTASIO}mg</Text>
          </View>
          <View style={styles.mineralBarContainer}>
            <View 
              style={[
                styles.mineralBar, 
                { 
                  backgroundColor: getMineralColor(potasioStatus),
                  width: `${Math.min(100, Math.max(10, safeValues.potasio / (THRESHOLDS.POTASIO * 1.5) * 100))}%`
                }
              ]} 
            />
          </View>
          <Text style={[
            styles.mineralValue,
            potasioStatus === 2 ? styles.mineralValueExceeded : 
            potasioStatus === 1 ? styles.mineralValueWarning : {}
          ]}>
            {potasioFormatted}
          </Text>
        </View>
        
        <View style={styles.mineralItem}>
          <View style={styles.mineralLabelContainer}>
            <Text style={styles.mineralLabel}>Fósforo</Text>
            <Text style={styles.mineralLimit}>Límite: {THRESHOLDS.FOSFORO}mg</Text>
          </View>
          <View style={styles.mineralBarContainer}>
            <View 
              style={[
                styles.mineralBar, 
                { 
                  backgroundColor: getMineralColor(fosforoStatus),
                  width: `${Math.min(100, Math.max(10, safeValues.fosforo / (THRESHOLDS.FOSFORO * 1.5) * 100))}%`
                }
              ]} 
            />
          </View>
          <Text style={[
            styles.mineralValue,
            fosforoStatus === 2 ? styles.mineralValueExceeded : 
            fosforoStatus === 1 ? styles.mineralValueWarning : {}
          ]}>
            {fosforoFormatted}
          </Text>
        </View>
      </View>
      
      {/* Legend for values - UPDATED with yellow indicator */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#4CAF50'}]}></View>
          <Text style={styles.legendText}>Dentro del límite recomendado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#FFC107'}]}></View>
          <Text style={styles.legendText}>Precaución, acercándose al límite</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#F44336'}]}></View>
          <Text style={styles.legendText}>Excede el límite recomendado</Text>
        </View>
        
        {/* Add a note about estimated values if applicable */}
        {esEstimacionIA && (
          <Text style={styles.estimadoNota}>
            Los valores mostrados son estimaciones de IA basadas en el análisis de imagen y 
            podrían variar respecto a los valores reales de la base de datos.
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8, // Reduced for more compact layout
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Slightly enhanced shadow for depth
    shadowRadius: 3,
    borderWidth: 0, // Ensure no border
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    textAlign: 'center', // Center title
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceContainer: {
    alignItems: 'center', // Center the badge
    marginBottom: 16,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  iaBadge: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFCC80',
  },
  realBadge: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  sourceText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  iaText: {
    color: '#FF6D00',
  },
  realText: {
    color: '#388E3C',
  },
  // Warning text style for yellow level
  mineralValueWarning: {
    color: '#FFA000',
    fontWeight: '600',
  },
  // Legacy styles
  estimadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  estimadoText: {
    fontSize: 12,
    color: '#E65100',
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
    width: 70,
  },
  mineralLabel: {
    fontSize: 14,
    color: '#333',
  },
  mineralLimit: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
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
  mineralValueExceeded: {
    color: '#F44336',
    fontWeight: '700',
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
  },
  estimadoNota: {
    fontSize: 12,
    color: '#F57C00',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#FFB74D',
    paddingLeft: 8,
    backgroundColor: '#FFF8E1',
    paddingVertical: 8,
    borderRadius: 4,
  }
});

// Use React.memo to prevent unnecessary re-renders but with a deep comparison function
export default memo(ResumenNutricionalCard, (prevProps, nextProps) => {
  // Custom comparison function to ensure component updates when nutritional values change
  // Return true only if the props should be considered equal (no re-render needed)
  if (!prevProps || !nextProps) return false;
  
  const prevCompatibilidad = prevProps.compatibilidad || {};
  const nextCompatibilidad = nextProps.compatibilidad || {};
  
  // Check if the source of data changed
  if (prevProps.fuenteValores !== nextProps.fuenteValores) {
    return false;
  }
  
  // Check if any of the mineral values changed
  const mineralsEqual = 
    prevCompatibilidad.sodio?.valor === nextCompatibilidad.sodio?.valor &&
    prevCompatibilidad.potasio?.valor === nextCompatibilidad.potasio?.valor &&
    prevCompatibilidad.fosforo?.valor === nextCompatibilidad.fosforo?.valor;
  
  return mineralsEqual;
});
