import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';
import { ENDPOINTS } from '../../../config/apiConfig';

/**
 * Modal para registrar el consumo de alimentos desde el escáner
 */
const RegistroConsumoScanModal = ({ 
  visible, 
  onClose, 
  nombreAlimento, 
  unidadTexto = '',
  onSuccess,
  nombreAnalisis = '',
  alimentoSeleccionado = null // Recibir el objeto completo del alimento ya seleccionado
}) => {
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notas, setNotas] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [unidadNombre, setUnidadNombre] = useState('');
  const [userId, setUserId] = useState(null);
  
  // Estados para manejo web
  const [webDate, setWebDate] = useState('');
  const [webTime, setWebTime] = useState('');

  // Efecto para precompletar las notas con el nombre del análisis
  useEffect(() => {
    if (visible && nombreAnalisis) {
      setNotas(`Alimento detectado en: ${nombreAnalisis}`);
    }
  }, [visible, nombreAnalisis]);
  
  // Extraer información de unidad desde el texto proporcionado
  useEffect(() => {
    if (unidadTexto) {
      // Extraer cantidad y unidad del texto (ej: "2 tazas")
      const match = unidadTexto.match(/^(\d*\.?\d*)\s+(.+)$/);
      if (match) {
        setCantidad(match[1] || '1');
        setUnidadNombre(match[2] || '');
      } else {
        setUnidadNombre(unidadTexto);
      }
    }
  }, [unidadTexto]);
  
  // Formatear fecha para inputs web
  useEffect(() => {
    if (Platform.OS === 'web' && fecha) {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      setWebDate(`${year}-${month}-${day}`);
      
      const hours = String(fecha.getHours()).padStart(2, '0');
      const minutes = String(fecha.getMinutes()).padStart(2, '0');
      setWebTime(`${hours}:${minutes}`);
    }
  }, [fecha]);
  
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
        setFecha(newDate);
      }
    }
  }, [webDate, webTime]);
  
  // Cargar ID de usuario
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUserId(parsed.persona_id || parsed.id);
        }
      } catch (e) {
        console.error('Error cargando datos del usuario:', e);
      }
    };
    
    if (visible) {
      loadUserId();
      setFecha(new Date()); // Resetear fecha a la actual cuando se abre el modal
    }
  }, [visible]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const formatearFecha = (fecha) => {
    try {
      const opciones = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      return fecha.toLocaleString();
    }
  };

  const handleRegistrarConsumo = async () => {
    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar al usuario. Por favor inicie sesión nuevamente.');
      return;
    }

    if (!nombreAlimento) {
      Alert.alert('Error', 'No se ha seleccionado ningún alimento válido.');
      return;
    }

    setLoading(true);

    try {
      // Verificar si tenemos el objeto completo del alimento
      let alimentoData;
      
      // Si tenemos el objeto completo ya seleccionado, usarlo directamente
      if (alimentoSeleccionado && alimentoSeleccionado.id) {
        alimentoData = alimentoSeleccionado;
      } else {
        // Fallback: buscar el alimento en la base de datos (mantener por compatibilidad)
        const searchResponse = await api.get(`/alimentos/?search=${encodeURIComponent(nombreAlimento)}&exact=true`);
        
        if (!searchResponse.data || !Array.isArray(searchResponse.data) || searchResponse.data.length === 0) {
          throw new Error(`No se encontró el alimento "${nombreAlimento}" en la base de datos.`);
        }
        
        // Buscar coincidencia exacta primero
        alimentoData = searchResponse.data.find(item => 
          item.nombre.toLowerCase() === nombreAlimento.toLowerCase()
        ) || searchResponse.data[0];
      }
      
      // Si el alimento seleccionado ya tiene unidad_seleccionada, usarla directamente
      let unidadMedidaId = null;
      if (alimentoSeleccionado && alimentoSeleccionado.unidad_seleccionada && alimentoSeleccionado.unidad_seleccionada.id) {
        unidadMedidaId = alimentoSeleccionado.unidad_seleccionada.id;
      }
      // Buscar la unidad por nombre
      else if (unidadNombre) {
        try {
          // Buscar la unidad por nombre
          const unidadResponse = await api.get(`/unidades-medida/?search=${encodeURIComponent(unidadNombre)}`);
          
          if (unidadResponse.data && Array.isArray(unidadResponse.data) && unidadResponse.data.length > 0) {
            // Usar el ID numérico de la unidad encontrada
            unidadMedidaId = unidadResponse.data[0].id;
          } else {
            // Si no se encuentra, usar una unidad predeterminada (ID 4 = Plato normal)
            unidadMedidaId = 4; 
          }
        } catch (unidadError) {
          console.error('Error al buscar unidad de medida:', unidadError);
          // Usar una unidad predeterminada como fallback
          unidadMedidaId = 4; // ID 4 = Plato normal
        }
      } else {
        // Si no se proporciona unidad, usar una unidad predeterminada
        unidadMedidaId = 4; // ID 4 = Plato normal
      }
      
      // Formatear fecha para API
      const fechaFormateada = fecha.toISOString().split('T')[0];
      
      // Crear registro completo con unidad_medida como ID numérico
      // y el ID exacto del alimento que se seleccionó
      const registroData = {
        alimento_id: alimentoData.id,
        alimento: alimentoData.id,
        id_alimento: alimentoData.id,
        cantidad: parseFloat(cantidad) || 1,
        unidad_medida: unidadMedidaId, // USAR ID NUMÉRICO, NO TEXTO
        fecha: fechaFormateada,
        fecha_consumo: fecha.toISOString(),
        notas: notas,
        persona_id: userId,
        id_persona: userId
      };
      
      // Usar el mismo endpoint que usa el módulo de alimentos
      const response = await api.post('/registros-comida/', registroData);
      
      Alert.alert(
        'Registro exitoso',
        `Se ha registrado el consumo de ${alimentoData.nombre}`,
        [{ text: 'Aceptar', onPress: () => {
          onClose();
          // Pasar el ID del alimento registrado a la función onSuccess
          onSuccess && onSuccess(alimentoData.id);
        }}]
      );
    } catch (error) {
      console.error('Error al registrar consumo:', error);
      
      let mensajeError = 'No se pudo registrar el consumo. Por favor intente nuevamente.';
      
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'object') {
          const detalles = Object.entries(error.response.data)
            .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
            .join('\n');
          mensajeError = `Error: ${detalles}`;
        }
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      Alert.alert('Error', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar selector de fecha para web
  const renderWebDateSelector = () => (
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Encabezado */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Registrar consumo</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Nombre del alimento */}
          <View style={styles.alimentoInfo}>
            <MaterialIcons name="restaurant" size={24} color="#690B22" />
            <View style={styles.alimentoTextContainer}>
              <Text style={styles.alimentoNombre}>{nombreAlimento}</Text>
            </View>
            
            {unidadTexto && (
              <View style={styles.unidadContainer}>
                <MaterialIcons name="straighten" size={16} color="#666" />
                <Text style={styles.unidadTexto}>{unidadTexto}</Text>
              </View>
            )}
          </View>
          
          {/* Fecha y hora */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Fecha y hora:</Text>
            
            {Platform.OS === 'web' ? (
              renderWebDateSelector()
            ) : (
              <TouchableOpacity 
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialIcons name="event" size={20} color="#690B22" />
                <Text style={styles.dateSelectorText}>
                  {formatearFecha(fecha)}
                </Text>
              </TouchableOpacity>
            )}
            
            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={fecha}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          
          {/* Notas adicionales */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Notas adicionales:</Text>
            <TextInput
              style={styles.notasInput}
              value={notas}
              onChangeText={setNotas}
              placeholder="Observaciones, detalles de preparación..."
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Botones de acción */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleRegistrarConsumo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="playlist-add-check" size={20} color="white" />
                  <Text style={styles.confirmButtonText}>Confirmar registro</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalHeader: {
    backgroundColor: '#4CAF50',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  
  // MEJORADO: Estructura del contenedor de información del alimento
  alimentoInfo: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  alimentoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  alimentoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  idDebugText: {
    fontSize: 10,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  
  // Resto de estilos
  unidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  unidadTexto: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  formGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    padding: 12,
    borderRadius: 8,
  },
  dateSelectorText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  notasInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  webDateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  webInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  webInputLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  webDateInput: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    fontSize: '16px',
  },
  webTimeInput: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    fontSize: '16px',
  }
});

export default RegistroConsumoScanModal;


