import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const CentroCard = ({ item, onOpenMaps, onCallPhone }) => {
  return (
    <Card style={styles.centroCard}>
      <Card.Content>
        <View style={styles.centroHeader}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.centroTitle}>{item.nombre}</Text>
            <Text style={styles.centroType}>{item.tipo_centro || 'Centro Médico'}</Text>
          </View>
          {item.servicio_dialisis && (
            <View style={styles.dialisisBadge}>
              <MaterialIcons name="water-drop" size={14} color="#FFFFFF" />
              <Text style={styles.dialisisText}>Diálisis</Text>
            </View>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoItem}>
          <MaterialIcons name="location-on" size={18} color="#690B22" />
          <Text style={styles.infoText}>{item.direccion}</Text>
        </View>
        
        {item.telefono && (
          <View style={styles.infoItem}>
            <MaterialIcons name="phone" size={18} color="#690B22" />
            <Text style={styles.infoText}>{item.telefono}</Text>
          </View>
        )}
        
        {item.horario && (
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={18} color="#690B22" />
            <Text style={styles.infoText}>{item.horario}</Text>
          </View>
        )}
        
        <View style={styles.actionButtons}>
          {item.telefono && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.callButton]}
              onPress={() => onCallPhone(item.telefono)}
            >
              <MaterialIcons name="phone" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Llamar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.verMapaButton}
            onPress={() => onOpenMaps(item.latitud, item.longitud, item.nombre)}
          >
            <MaterialIcons name="place" size={20} color="#690B22" />
            <Text style={styles.verMapaButtonText}>Ver Mapa</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  centroCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  centroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  centroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 3,
  },
  centroType: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  dialisisBadge: {
    backgroundColor: '#690B22',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  dialisisText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#E0E0E0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  verMapaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#690B22',
  },
  verMapaButtonText: {
    color: '#690B22',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default CentroCard;
