import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export default function MinutaScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [minutas, setMinutas] = useState([]);
  const [selectedMinuta, setSelectedMinuta] = useState(null);

  useEffect(() => {
    const fetchMinutas = async () => {
      try {
        setLoading(true);
        // Obtener ID de persona del usuario actual
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) {
          setLoading(false);
          return;
        }
        
        const { persona_id } = JSON.parse(userData);
        // Cargar minutas del usuario
        const response = await api.get(`/minutas-nutricionales/?id_persona=${persona_id}`);
        setMinutas(response.data);
        // Si hay minutas, seleccionar la primera por defecto
        if (response.data.length > 0) {
          setSelectedMinuta(response.data[0]);
        }
      } catch (error) {
        console.error('Error al cargar minutas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMinutas();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando su minuta nutricional...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.subtitle}>Plan alimentario personalizado</Text>
            </View>
            
            {minutas.length === 0 ? (
              <View style={styles.noDataContainer}>
                <MaterialIcons name="event-busy" size={48} color="#690B22" />
                <Text style={styles.noDataText}>
                  No tiene minutas nutricionales asignadas.
                </Text>
                <Text style={styles.noDataSubtext}>
                  Consulte con su nutricionista o especialista para crear una.
                </Text>
              </View>
            ) : (
              <>
                {/* Selector de minuta si hay más de una */}
                {minutas.length > 1 && (
                  <View style={styles.minutaSelector}>
                    <Text style={styles.selectorLabel}>Seleccione una minuta:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {minutas.map(minuta => (
                        <TouchableOpacity
                          key={minuta.id}
                          style={[
                            styles.minutaTab,
                            selectedMinuta?.id === minuta.id && styles.selectedMinutaTab
                          ]}
                          onPress={() => setSelectedMinuta(minuta)}
                        >
                          <Text style={[
                            styles.minutaTabText,
                            selectedMinuta?.id === minuta.id && styles.selectedMinutaTabText
                          ]}>
                            {`Plan ${new Date(minuta.fecha_creacion).toLocaleDateString()}`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
                {selectedMinuta && (
                  <View style={styles.minutaDetails}>
                    <Text style={styles.detailsHeader}>
                      Minuta creada: {new Date(selectedMinuta.fecha_creacion).toLocaleDateString()}
                    </Text>
                    <Text style={styles.detailsSubheader}>
                      Vigente hasta: {new Date(selectedMinuta.fecha_vigencia).toLocaleDateString()}
                    </Text>
                    
                    <Divider style={styles.divider} />
                    
                    {/* Ejemplo de contenido - Aquí se mostrarían los detalles reales */}
                    <View style={styles.mealGroup}>
                      <Text style={styles.mealHeader}>Desayuno</Text>
                      <View style={styles.mealItem}>
                        <Text style={styles.mealItemName}>• Avena con leche descremada</Text>
                        <Text style={styles.mealItemDesc}>1 taza de avena cocida con leche descremada</Text>
                      </View>
                      <View style={styles.mealItem}>
                        <Text style={styles.mealItemName}>• Tostada integral</Text>
                        <Text style={styles.mealItemDesc}>1 rebanada con queso fresco bajo en sodio</Text>
                      </View>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.mealGroup}>
                      <Text style={styles.mealHeader}>Almuerzo</Text>
                      <View style={styles.mealItem}>
                        <Text style={styles.mealItemName}>• Pollo a la plancha</Text>
                        <Text style={styles.mealItemDesc}>120g de filete de pollo con especias naturales</Text>
                      </View>
                      <View style={styles.mealItem}>
                        <Text style={styles.mealItemName}>• Arroz blanco</Text>
                        <Text style={styles.mealItemDesc}>1/2 taza de arroz cocido sin sal</Text>
                      </View>
                      <View style={styles.mealItem}>
                        <Text style={styles.mealItemName}>• Ensalada verde</Text>
                        <Text style={styles.mealItemDesc}>Lechuga, pepino y tomate con aceite de oliva</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity style={styles.printButton}>
                      <MaterialIcons name="print" size={20} color="#FFFFFF" />
                      <Text style={styles.printButtonText}>Imprimir Minuta</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E8D8',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  card: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#690B22',
    fontStyle: 'italic',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  minutaSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 10,
  },
  minutaTab: {
    backgroundColor: '#F1E3D3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedMinutaTab: {
    backgroundColor: '#E07A5F',
  },
  minutaTabText: {
    color: '#1B4D3E',
  },
  selectedMinutaTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  minutaDetails: {
    marginTop: 10,
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  detailsSubheader: {
    fontSize: 16,
    color: '#690B22',
    marginTop: 4,
  },
  divider: {
    marginVertical: 15,
    height: 1,
  },
  mealGroup: {
    marginBottom: 20,
  },
  mealHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 10,
    backgroundColor: '#F8E8D8',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  mealItem: {
    marginBottom: 10,
    paddingLeft: 10,
  },
  mealItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1B4D3E',
  },
  mealItemDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    paddingLeft: 15,
  },
  printButton: {
    backgroundColor: '#690B22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  printButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
