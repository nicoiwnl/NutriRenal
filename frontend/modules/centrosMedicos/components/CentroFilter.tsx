import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CentroFilter = ({ 
  filterDialisis, 
  setFilterDialisis, 
  viewMode, 
  onChangeViewMode, 
  isWebView 
}) => {
  return (
    <View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Solo centros con servicio de diálisis</Text>
        <Switch
          value={filterDialisis}
          onValueChange={setFilterDialisis}
          trackColor={{ false: "#ccc", true: "#690B22" }}
          thumbColor={filterDialisis ? "#fff" : "#f4f3f4"}
        />
      </View>
      
      {/* Mostrar aviso para versión web sobre limitaciones */}
      {Platform.OS === 'web' && (
        <View style={styles.webNoticeContainer}>
          <MaterialIcons name="info" size={20} color="#690B22" />
          <Text style={styles.webNoticeText}>
            La vista de mapa está disponible solo en la aplicación móvil
          </Text>
        </View>
      )}
      
      {/* Botones de modo de vista - solo mostrar en móvil si corresponde */}
      {Platform.OS !== 'web' && (
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'list' && styles.viewModeButtonActive
            ]}
            onPress={() => onChangeViewMode('list')}
          >
            <MaterialIcons 
              name="view-list" 
              size={20} 
              color={viewMode === 'list' ? '#FFFFFF' : '#1B4D3E'} 
            />
            <Text style={[
              styles.viewModeText,
              viewMode === 'list' && styles.viewModeTextActive
            ]}>
              Lista
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'map' && styles.viewModeButtonActive
            ]}
            onPress={() => onChangeViewMode('map')}
          >
            <MaterialIcons 
              name="map" 
              size={20} 
              color={viewMode === 'map' ? '#FFFFFF' : '#1B4D3E'} 
            />
            <Text style={[
              styles.viewModeText,
              viewMode === 'map' && styles.viewModeTextActive
            ]}>
              Mapa
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  filterLabel: {
    fontSize: 16,
    color: '#1B4D3E',
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1B4D3E',
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  viewModeButtonActive: {
    backgroundColor: '#1B4D3E',
  },
  viewModeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#1B4D3E',
    fontWeight: '500',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  webNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8E8D8',
    borderWidth: 1,
    borderColor: '#E07A5F',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  webNoticeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#690B22',
    flex: 1,
  },
});

export default CentroFilter;
