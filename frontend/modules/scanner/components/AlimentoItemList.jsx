import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AlimentoItemList = ({ 
  alimentos, 
  results, 
  seleccionesEspecificas, 
  foodsWithUnits,
  onSelectAlimento,
  isReadOnly = false
}) => {
  if (!alimentos || alimentos.length === 0) {
    return (
      <View style={styles.noResultsContainer}>
        <MaterialIcons name="search-off" size={40} color="#999" />
        <Text style={styles.noResultsText}>
          No se pudieron identificar alimentos en la imagen
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Instructivo para una mejor UX */}
      {alimentos.length > 0 && !isReadOnly && (
        <View style={styles.instructionBanner}>
          <MaterialIcons name="touch-app" size={22} color="#1B4D3E" />
          <Text style={styles.instructionText}>
            Toca cada alimento para seleccionar la versión correcta y obtener información nutricional precisa
          </Text>
        </View>
      )}
      
      <FlatList
        data={alimentos}
        keyExtractor={(item, index) => `alimento-${index}`}
        renderItem={({ item }) => {
          // Check if there's a specific selection for this item
          const nombreEspecifico = seleccionesEspecificas[item] || item;
          const unidadTexto = foodsWithUnits[nombreEspecifico];
          const isUpdated = seleccionesEspecificas[item] && seleccionesEspecificas[item] !== item;
          
          return (
            <TouchableOpacity
              style={[
                styles.alimentoItem,
                isUpdated ? styles.alimentoItemUpdated : {}
              ]}
              onPress={() => onSelectAlimento(item)}
              disabled={isReadOnly}
            >
              <View style={styles.alimentoContent}>
                <View style={[
                  styles.iconContainer,
                  isUpdated ? styles.iconContainerUpdated : {}
                ]}>
                  <MaterialIcons 
                    name={isUpdated ? "check-circle" : "restaurant"} 
                    size={20} 
                    color={isUpdated ? "#FFFFFF" : "#690B22"} 
                  />
                </View>
                
                <View style={styles.alimentoTextContainer}>
                  <Text style={styles.alimentoNombre}>
                    {nombreEspecifico}
                    {unidadTexto ? ` (${unidadTexto})` : ''}
                  </Text>
                  
                  {/* If there's a different specific selection, show the original detected term */}
                  {nombreEspecifico !== item && (
                    <Text style={styles.detectedAs}>
                      Detectado como: <Text style={styles.detectedTerm}>{item}</Text>
                    </Text>
                  )}
                  
                  {/* Show "Actualizado" badge when food is updated */}
                  {isUpdated && (
                    <View style={styles.updatedBadge}>
                      <Text style={styles.updatedBadgeText}>Actualizado</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Only show edit button if not in read-only mode */}
              {!isReadOnly && (
                <View style={styles.actionContainer}>
                  <MaterialIcons name="edit" size={24} color="#690B22" />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  alimentoItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  alimentoItemUpdated: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F8FFF8', // Añadir un fondo ligeramente verde para mayor visibilidad
  },
  alimentoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1E3D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerUpdated: {
    backgroundColor: '#4CAF50',
  },
  alimentoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  alimentoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  detectedAs: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detectedTerm: {
    fontStyle: 'italic',
    color: '#999',
  },
  updatedBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  updatedBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionContainer: {
    padding: 6,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
  },
  noResultsContainer: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#1B4D3E',
    marginLeft: 8,
    lineHeight: 18,
  },
});

export default AlimentoItemList;
