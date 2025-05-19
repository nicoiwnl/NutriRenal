import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegistroModal = ({ 
  visible, 
  onDismiss, 
  alimento, 
  selectedUnit, 
  onSuccess,
  unidadesMedida
}) => {
  const [fechaConsumo, setFechaConsumo] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [currentSelectedUnit, setCurrentSelectedUnit] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Resumen nutricional calculado solo en base a la unidad
  const [resumenNutricional, setResumenNutricional] = useState({
    energia: 0,
    sodio: 0,
    potasio: 0,
    fosforo: 0
  });

  // Estado adicional para el selector web
  const [webDate, setWebDate] = useState('');
  const [webTime, setWebTime] = useState('');
  
  // Inicializar la unidad seleccionada con la que viene como prop
  useEffect(() => {
    if (selectedUnit) {
      setCurrentSelectedUnit(selectedUnit);
    }
  }, [selectedUnit]);

  // Recalcular valores nutricionales cuando cambia la unidad seleccionada
  useEffect(() => {
    if (alimento && currentSelectedUnit) {
      let factor = 1;
      
      // Calcular el factor de conversión para la unidad seleccionada
      if (currentSelectedUnit.es_volumen && currentSelectedUnit.equivalencia_ml) {
        factor = Number(currentSelectedUnit.equivalencia_ml) / 100;
      } else if (!currentSelectedUnit.es_volumen && currentSelectedUnit.equivalencia_g) {
        factor = Number(currentSelectedUnit.equivalencia_g) / 100;
      }
      
      // Calcular el resumen nutricional - cantidad siempre es 1
      setResumenNutricional({
        energia: Math.round((alimento.energia || 0) * factor),
        sodio: Math.round((alimento.sodio || 0) * factor),
        potasio: Math.round((alimento.potasio || 0) * factor),
        fosforo: Math.round((alimento.fosforo || 0) * factor)
      });
    }
  }, [alimento, currentSelectedUnit]);

  // Formatear fecha para inputs HTML
  useEffect(() => {
    if (fechaConsumo && Platform.OS === 'web') {
      const year = fechaConsumo.getFullYear();
      const month = String(fechaConsumo.getMonth() + 1).padStart(2, '0');
      const day = String(fechaConsumo.getDate()).padStart(2, '0');
      setWebDate(`${year}-${month}-${day}`);
      
      const hours = String(fechaConsumo.getHours()).padStart(2, '0');
      const minutes = String(fechaConsumo.getMinutes()).padStart(2, '0');
      setWebTime(`${hours}:${minutes}`);
    }
  }, [fechaConsumo]);
  
  // Actualizar fechaConsumo cuando cambian los inputs web
  useEffect(() => {
    if (Platform.OS === 'web' && webDate && webTime) {
      const [year, month, day] = webDate.split('-');
      const [hours, minutes] = webTime.split(':');
      const newDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
      if (!isNaN(newDate.getTime())) {
        setFechaConsumo(newDate);
      }
    }
  }, [webDate, webTime]);

  // Reiniciar fecha a la actual cada vez que se abre el modal
  useEffect(() => {
    if (visible) {
      setFechaConsumo(new Date());
    }
  }, [visible]);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          setUserData(JSON.parse(userDataStr));
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    };
    
    getUserData();
  }, []);

  const handleRegister = async () => {
    // Verificar que tenemos todos los datos necesarios
    if (!currentSelectedUnit || !currentSelectedUnit.id) {
      Alert.alert('Error', 'No se ha seleccionado una unidad de medida válida');
      return;
    }
    
    if (!userData || !userData.persona_id) {
      Alert.alert('Error', 'No se encontró información del usuario. Por favor, inicie sesión nuevamente.');
      return;
    }

    try {
      setLoading(true);
      
      // Construir el objeto con todos los campos requeridos
      const registroData = {
        alimento: alimento.id,
        cantidad: 1, // Cantidad fija = 1
        unidad_medida: currentSelectedUnit.id,
        fecha_consumo: fechaConsumo.toISOString(),
        notas: notas,
        id_persona: userData.persona_id
      };
      
      console.log('Enviando datos:', registroData);
      
      const response = await api.post('/registros-comida/', registroData);

      setLoading(false);
      onDismiss();
      onSuccess && onSuccess();
      
      Alert.alert(
        'Consumo Registrado', 
        'El consumo ha sido registrado exitosamente.'
      );
    } catch (error) {
      setLoading(false);
      
      // Mejorar el mensaje de error para mostrar más detalles
      let errorMessage = 'No se pudo registrar el consumo. Por favor intente nuevamente.';
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        if (typeof error.response.data === 'object') {
          // Extraer detalles del error si están disponibles
          const errorDetails = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          
          errorMessage = `Error en el servidor: ${errorDetails || error.response.status}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
      console.error('Error registering consumption:', error);
    }
  };

  // Componente de Modal para seleccionar unidad
  const UnitSelectorModal = () => (
    <Modal
      visible={showUnitSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowUnitSelector(false)}
    >
      <View style={styles.unitSelectorOverlay}>
        <View style={styles.unitSelectorContainer}>
          <View style={styles.unitSelectorHeader}>
            <Text style={styles.unitSelectorTitle}>Seleccionar unidad</Text>
            <TouchableOpacity 
              onPress={() => setShowUnitSelector(false)}
              style={styles.unitSelectorCloseButton}
            >
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={unidadesMedida}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.unitItem, 
                  currentSelectedUnit?.id === item.id && styles.selectedUnitItem
                ]}
                onPress={() => {
                  setCurrentSelectedUnit(item);
                  setShowUnitSelector(false);
                }}
              >
                <Text style={[
                  styles.unitItemText,
                  currentSelectedUnit?.id === item.id && styles.selectedUnitItemText
                ]}>
                  {item.nombre}
                </Text>
                {currentSelectedUnit?.id === item.id && (
                  <MaterialIcons name="check" size={20} color="#690B22" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Función para formatear fecha en español
  const formatearFecha = (fecha) => {
    try {
      // Formato para mostrar: "lunes, 15 de abril 2024 a las 14:30"
      const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return fecha.toLocaleDateString('es-ES', opciones)
                 .replace(' a las', '')
                 .replace(',', '');
    } catch (error) {
      return fecha.toLocaleString();
    }
  };

  // Función para restaurar fecha actual
  const restaurarFechaActual = () => {
    setFechaConsumo(new Date());
  };

  // Renderizar selector de fecha para web
  const renderWebDateSelector = () => {
    return (
      <View style={styles.webDateTimeContainer}>
        <View style={styles.webInputContainer}>
          <Text style={styles.webInputLabel}>Fecha:</Text>
          <input
            type="date"
            value={webDate}
            onChange={(e) => setWebDate(e.target.value)}
            style={styles.webDateInput}
          />
        </View>
        <View style={styles.webInputContainer}>
          <Text style={styles.webInputLabel}>Hora:</Text>
          <input
            type="time"
            value={webTime}
            onChange={(e) => setWebTime(e.target.value)}
            style={styles.webTimeInput}
          />
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Encabezado */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Registrar consumo
            </Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onDismiss}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Nombre del alimento */}
          <View style={styles.alimentoHeader}>
            <MaterialIcons name="restaurant" size={24} color="#690B22" />
            <Text style={styles.alimentoNombre}>{alimento.nombre}</Text>
          </View>
          
          <ScrollView style={styles.formContainer}>
            {/* Selector de unidad */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Unidad de consumo:</Text>
              <TouchableOpacity 
                style={styles.unitSelector}
                onPress={() => setShowUnitSelector(true)}
              >
                <Text style={styles.unitSelectorText}>
                  1 {currentSelectedUnit?.nombre || 'unidad'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#690B22" />
              </TouchableOpacity>
            </View>
            
            {/* Fecha y hora */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Fecha y hora:</Text>
              <View>
                {Platform.OS === 'web' ? (
                  renderWebDateSelector()
                ) : (
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    style={styles.dateSelector}
                  >
                    <Text style={styles.dateSelectorText}>
                      {formatearFecha(fechaConsumo)}
                    </Text>
                    <MaterialIcons name="event" size={24} color="#690B22" />
                  </TouchableOpacity>
                )}
                
                {/* Botón para restaurar fecha actual */}
                <TouchableOpacity 
                  style={styles.resetDateButton}
                  onPress={restaurarFechaActual}
                >
                  <MaterialIcons name="restore" size={16} color="#690B22" />
                  <Text style={styles.resetDateText}>Usar fecha actual</Text>
                </TouchableOpacity>
                
                {showDatePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={fechaConsumo}
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setFechaConsumo(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            </View>
            
            {/* Notas */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notas (opcional):</Text>
              <TextInput
                value={notas}
                onChangeText={setNotas}
                multiline
                numberOfLines={4}
                style={styles.notasInput}
                placeholder="Añada notas adicionales sobre este consumo"
              />
            </View>
            
            {/* Resumen nutricional */}
            <View style={styles.resumenContainer}>
              <Text style={styles.resumenTitle}>Resumen nutricional</Text>
              <View style={styles.resumenGrid}>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenValue}>{resumenNutricional.energia}</Text>
                  <Text style={styles.resumenLabel}>Calorías</Text>
                </View>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenValue}>{resumenNutricional.sodio}</Text>
                  <Text style={styles.resumenLabel}>Sodio (mg)</Text>
                </View>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenValue}>{resumenNutricional.potasio}</Text>
                  <Text style={styles.resumenLabel}>Potasio (mg)</Text>
                </View>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenValue}>{resumenNutricional.fosforo}</Text>
                  <Text style={styles.resumenLabel}>Fósforo (mg)</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          
          {/* Botones de acción */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              onPress={onDismiss}
              style={styles.cancelButton}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleRegister}
              style={styles.confirmButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Registrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Modal selector de unidades */}
      <UnitSelectorModal />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    backgroundColor: '#690B22',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  closeButton: {
    padding: 5
  },
  alimentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F0E8',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF'
  },
  alimentoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginLeft: 10,
    flex: 1
  },
  formContainer: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 20
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8
  },
  // Nuevo selector de unidad como menú desplegable
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF'
  },
  unitSelectorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E'
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#333'
  },
  notasInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  resumenContainer: {
    backgroundColor: '#F8F0E8',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    marginBottom: 20
  },
  resumenTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 15,
    textAlign: 'center'
  },
  resumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  resumenItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  resumenValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E'
  },
  resumenLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    justifyContent: 'space-between'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  // Estilos para el modal de selección de unidad
  unitSelectorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20
  },
  unitSelectorContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%'
  },
  unitSelectorHeader: {
    backgroundColor: '#690B22',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  unitSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  unitSelectorCloseButton: {
    padding: 5
  },
  unitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF'
  },
  selectedUnitItem: {
    backgroundColor: '#F8F0E8',
    borderLeftWidth: 4,
    borderLeftColor: '#690B22'
  },
  unitItemText: {
    fontSize: 16,
    color: '#1B4D3E'
  },
  selectedUnitItemText: {
    fontWeight: 'bold'
  },
  resetDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    marginRight: 4,
  },
  resetDateText: {
    fontSize: 14,
    color: '#690B22',
    marginLeft: 6,
    fontWeight: '500',
  },
  // Estilos para selector de fecha en web
  webDateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  webInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  webInputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  webDateInput: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
  },
  webTimeInput: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
  },
});

export default RegistroModal;
