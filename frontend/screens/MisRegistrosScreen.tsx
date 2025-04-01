import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import caregiverService from '../services/caregiverService';
import { getImageUrl, getProfileImageUrl, WebImage } from '../utils/imageHelper';

export default function MisRegistrosScreen(props) {
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week'); // 'week' or 'month'
  const [userData, setUserData] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null); // Estado para el ID del paciente seleccionado
  const [linkedPatients, setLinkedPatients] = useState<any[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<any[]>([]); // Agregar estado para almacenar las unidades de medida
  
  // Format date in Spanish (e.g., "18 de marzo 2025")
  const formatDateInSpanish = (dateInput: string | Date): string => {
    // Crear una nueva fecha asegurándose que sea en formato local
    let date: Date;
    
    if (typeof dateInput === 'string') {
      // Si es una cadena de texto (YYYY-MM-DD), asegurarse de interpretarla como fecha local
      const [year, month, day] = dateInput.split('-').map(num => parseInt(num, 10));
      date = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar problemas de zona horaria
    } else {
      date = new Date(dateInput);
    }
    
    // No necesitamos ajustar la zona horaria, solo formatear correctamente
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  
  // Get the current week's dates
  const getCurrentWeekDates = () => {
    // Get current date
    const today = new Date();
    // Get Monday of current week
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday
    monday.setDate(diff);
    
    // Generate an array of dates for the week (Monday through Sunday)
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDates.push({
        dateString: day.toISOString().split('T')[0],
        day: day.getDate(),
        dayName: day.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase(),
        isToday: day.toDateString() === today.toDateString()
      });
    }
    
    return weekDates;
  };

  const weekDates = getCurrentWeekDates();

  useEffect(() => {
    fetchRegistros();
    
    // Set today's date as the selected date on component mount
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);
  
  // MODIFICACIÓN: actualizar fetchRegistros para usar selectedPatientId si el usuario es cuidador
  const fetchRegistros = async () => {
    try {
      setLoading(true);
      const userDataStr = await AsyncStorage.getItem('userData');
      if (!userDataStr) {
        setLoading(false);
        return;
      }
      const userData = JSON.parse(userDataStr);
      setUserData(userData);
      // Usar la id del paciente seleccionado si el rol es cuidador, sino la id del usuario
      const persona_id = (userData.role === 'cuidador' && selectedPatientId)
        ? selectedPatientId
        : userData.persona_id;
      const response = await api.get(`/registros-comida/?id_persona=${persona_id}`);
      
      // Procesar registros para agruparlos por fecha
      const registrosConDetalles = await Promise.all(
        response.data.map(async (registro: any) => {
          try {
            // Obtener detalles del alimento
            const alimentoResponse = await api.get(`/alimentos/${registro.alimento}/`);
            return {
              ...registro,
              detalleAlimento: alimentoResponse.data
            };
          } catch (error) {
            console.error('Error al obtener detalles de alimento:', error);
            return {
              ...registro,
              detalleAlimento: { nombre: 'Alimento desconocido' }
            };
          }
        })
      );
      
      setRegistros(registrosConDetalles as any[]);
      
      // Marcar fechas en el calendario
      const fechasRegistradas = {};
      registrosConDetalles.forEach(registro => {
        const fecha = registro.fecha_consumo.split('T')[0];
        (fechasRegistradas as Record<string, any>)[fecha] = {
          marked: true,
          dotColor: '#690B22'
        };
      });
      setMarkedDates(fechasRegistradas);
      
    } catch (error) {
      console.error('Error al cargar registros:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // AGREGAR: Re-cargar registros cuando cambie el paciente seleccionado (para cuidadores)
  useEffect(() => {
    if (userData && (userData.role !== 'cuidador' || selectedPatientId)) {
      fetchRegistros();
    }
  }, [selectedPatientId]);
  
  // New: Load linked patients for caregiver
  const loadLinkedPatients = async () => {
    try {
      setLoading(true);
      const patients = await caregiverService.getPatientsList(userData.persona_id);
      
      // Añadir depuración para ver los datos que llegan
      console.log('Datos de pacientes recibidos:', JSON.stringify(patients, null, 2));
      
      setLinkedPatients(patients);
    } catch (error) {
      console.error("Error loading linked patients: ", error);
    } finally {
      setLoading(false);
    }
  };

  // New: When role is "cuidador" and no patient is selected, load patients
  useEffect(() => {
    if (userData && userData.role === 'cuidador' && !selectedPatientId) {
      loadLinkedPatients();
    }
  }, [userData, selectedPatientId]);
  
  // Efecto para cargar las unidades de medida
  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const response = await api.get('/unidades-medida/');
        const units = response.data.map((unit: any) => ({
           ...unit,
           id: typeof unit.id === 'string' ? parseInt(unit.id, 10) : unit.id,
        }));
        setUnidadesMedida(units);
      } catch (error) {
        console.error('Error fetching unidades de medida:', error);
      }
    };
    fetchUnidades();
  }, []);

  // Helper para calcular valores ajustados
  const computeAdjustedValues = (alimento: any, unidad: any) => {
    let factor = 1;
    if (unidad) {
      if (unidad.es_volumen && unidad.equivalencia_ml) {
        factor = Number(unidad.equivalencia_ml) / 100;
      } else if (!unidad.es_volumen && unidad.equivalencia_g) {
        factor = Number(unidad.equivalencia_g) / 100;
      }
    }
    return {
      energia: alimento.energia ? Math.round(alimento.energia * factor) : 0,
      sodio: alimento.sodio ? Math.round(alimento.sodio * factor) : 0,
      potasio: alimento.potasio ? Math.round(alimento.potasio * factor) : 0,
      fosforo: alimento.fosforo ? Math.round(alimento.fosforo * factor) : 0,
    };
  };

  // Filtrar registros por fecha seleccionada
  const registrosFiltrados = useMemo(() => {
    if (!selectedDate) return [];
    
    // Solución mejorada para manejar el desfase horario
    return registros.filter((registro: any) => {
      // Obtener la fecha del registro
      const fechaRegistro = new Date(registro.fecha_consumo);
      
      // Extraer año, mes y día en zona horaria local
      const year = fechaRegistro.getFullYear();
      const month = String(fechaRegistro.getMonth() + 1).padStart(2, '0');
      const day = String(fechaRegistro.getDate()).padStart(2, '0');
      
      // Formatear como "YYYY-MM-DD" en zona horaria local
      const fechaRegistroLocal = `${year}-${month}-${day}`;
      
      // Comparar con la fecha seleccionada
      return fechaRegistroLocal === selectedDate;
    });
  }, [selectedDate, registros]);

  // Calcular totales nutricionales para la fecha seleccionada
  const totalesDiarios = useMemo(() => {
    if (!registrosFiltrados.length) return { calorias: 0, fosforo: 0, sodio: 0, potasio: 0 };
    
    return registrosFiltrados.reduce((acc, registro) => {
      const alimento = (registro as any).detalleAlimento;
      if (!alimento) return acc;
      
      // Obtener la unidad de medida asociada con este registro
      const unidadMedida = unidadesMedida.find(u => u.id === registro.unidad_medida);
      
      // Calcular los valores ajustados según la unidad de medida
      let factorConversion = 1;
      if (unidadMedida) {
        if (unidadMedida.es_volumen && unidadMedida.equivalencia_ml) {
          factorConversion = Number(unidadMedida.equivalencia_ml) / 100;
        } else if (!unidadMedida.es_volumen && unidadMedida.equivalencia_g) {
          factorConversion = Number(unidadMedida.equivalencia_g) / 100;
        }
      }
      
      // Si hay problemas con el factorConversion, usar valor predeterminado
      if (isNaN(factorConversion) || factorConversion <= 0) {
        factorConversion = 1;
      }
      
      // Sumar valores ajustados al acumulador
      return {
        calorias: acc.calorias + ((parseFloat(alimento.energia) || 0) * factorConversion),
        fosforo: acc.fosforo + ((parseFloat(alimento.fosforo) || 0) * factorConversion),
        sodio: acc.sodio + ((parseFloat(alimento.sodio) || 0) * factorConversion),
        potasio: acc.potasio + ((parseFloat(alimento.potasio) || 0) * factorConversion)
      };
    }, { calorias: 0, fosforo: 0, sodio: 0, potasio: 0 });
  }, [registrosFiltrados, unidadesMedida]);
  
  // Actualizar la función para formatear la fecha de consumo
  const formatDate = (dateString: string) => {
    // Crear una nueva fecha respetando la zona horaria local
    const date = new Date(dateString);
    
    // Formatear la fecha con hora local
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Add a function to determine nutrient color based on value
  const getNutrientColor = (nutrient: string, value: number) => {
    if (nutrient === 'sodio') {
      if (value > 500) return '#F44336'; // Red - high
      if (value > 300) return '#FFC107'; // Yellow - medium
      return '#4CAF50'; // Green - low
    } 
    else if (nutrient === 'potasio') {
      if (value > 800) return '#F44336'; // Red - high
      if (value > 500) return '#FFC107'; // Yellow - medium
      return '#4CAF50'; // Green - low
    }
    else if (nutrient === 'fosforo') {
      if (value > 300) return '#F44336'; // Red - high
      if (value > 150) return '#FFC107'; // Yellow - medium
      return '#4CAF50'; // Green - low
    }
    return '#9E9E9E'; // Default gray
  };

  // Agregar una función para determinar el color del valor basado en los umbrales diarios
  const getNutrientDailyColor = (nutrient: string, value: number) => {
    // Umbrales para valores diarios acumulados (más altos que los de una porción individual)
    if (nutrient === 'sodio') {
      if (value > 1500) return '#F44336'; // Rojo - pasó el límite diario recomendado
      if (value > 1000) return '#FFC107'; // Amarillo - acercándose al límite
      return '#4CAF50'; // Verde - nivel seguro
    } 
    else if (nutrient === 'potasio') {
      if (value > 2500) return '#F44336'; // Rojo
      if (value > 2000) return '#FFC107'; // Amarillo
      return '#4CAF50'; // Verde
    }
    else if (nutrient === 'fosforo') {
      if (value > 900) return '#F44336'; // Rojo
      if (value > 700) return '#FFC107'; // Amarillo
      return '#4CAF50'; // Verde
    }
    return '#1B4D3E'; // Color por defecto
  };

  const renderResumenDiario = () => {
    if (!selectedDate) return null;
    
    // Format the date in Spanish (e.g., "18 de marzo 2025")
    const formattedDate = formatDateInSpanish(selectedDate);
    
    // Determinar colores de los valores nutricionales
    const sodioColor = getNutrientDailyColor('sodio', totalesDiarios.sodio);
    const fosforoColor = getNutrientDailyColor('fosforo', totalesDiarios.fosforo);
    const potasioColor = getNutrientDailyColor('potasio', totalesDiarios.potasio);
    
    return (
      <Card style={styles.resumenCard}>
        <Card.Content style={styles.resumenContent}>
          <View style={styles.resumenHeader}>
            <Text style={styles.resumenTitle}>{formattedDate}</Text>
            <View style={styles.resumenSubtitleContainer}>
              <Text style={styles.resumenSubtitle}>
                {registrosFiltrados.length} alimentos
              </Text>
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => {
                  // Puedes mostrar un modal o alerta con más información 
                  Alert.alert(
                    "Rangos recomendados diarios", 
                    "Para pacientes renales:\n\n• Sodio: 1500-2000 mg/día\n• Potasio: 2000-3000 mg/día\n• Fósforo: 800-1000 mg/día\n\nConsulta siempre con tu médico para recomendaciones personalizadas.",
                    [{ text: "Entendido" }]
                  )
                }}
              >
                <MaterialIcons name="info-outline" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.resumenStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(totalesDiarios.calorias)}</Text>
              <Text style={styles.statLabel}>Calorías</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: sodioColor }]}>
                {Math.round(totalesDiarios.sodio)}
              </Text>
              <Text style={styles.statLabel}>Sodio</Text>
              <Text style={styles.rangeText}>1500-2000mg</Text>
              {totalesDiarios.sodio > 1000 && (
                <MaterialIcons 
                  name="warning" 
                  size={14} 
                  color={sodioColor} 
                  style={styles.warningIcon} 
                />
              )}
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: fosforoColor }]}>
                {Math.round(totalesDiarios.fosforo)}
              </Text>
              <Text style={styles.statLabel}>Fósforo</Text>
              <Text style={styles.rangeText}>800-1000mg</Text>
              {totalesDiarios.fosforo > 700 && (
                <MaterialIcons 
                  name="warning" 
                  size={14} 
                  color={fosforoColor} 
                  style={styles.warningIcon} 
                />
              )}
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: potasioColor }]}>
                {Math.round(totalesDiarios.potasio)}
              </Text>
              <Text style={styles.statLabel}>Potasio</Text>
              <Text style={styles.rangeText}>2000-3000mg</Text>
              {totalesDiarios.potasio > 2000 && (
                <MaterialIcons 
                  name="warning" 
                  size={14} 
                  color={potasioColor}
                  style={styles.warningIcon} 
                />
              )}
            </View>
          </View>
          
          {(totalesDiarios.sodio > 1000 || totalesDiarios.potasio > 2000 || totalesDiarios.fosforo > 700) && (
            <View style={styles.dailyWarningContainer}>
              <MaterialIcons name="info-outline" size={16} color="#F44336" />
              <Text style={styles.dailyWarningText}>
                Al menos un nutriente se acerca o supera los límites diarios recomendados
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderRegistroItem = ({ item }: { item: any }) => {
    const alimento = item.detalleAlimento;
    if (!alimento) return null;
    
    // Buscar la unidad de medida usando el id del registro
    const unidad = unidadesMedida.find(u => u.id === item.unidad_medida);
    
    // Calcular valores ajustados según la unidad de medida
    const adjusted = alimento ? computeAdjustedValues(alimento, unidad) : {
      energia: 0, sodio: 0, potasio: 0, fosforo: 0
    };
    
    // Obtener colores para los nutrientes basados en los valores ajustados
    const sodioColor = getNutrientColor('sodio', adjusted.sodio);
    const fosforoColor = getNutrientColor('fosforo', adjusted.fosforo);
    const potasioColor = getNutrientColor('potasio', adjusted.potasio);

    // Extract patient data if in caregiver mode
    const pacienteInfo = userData.role === 'cuidador' ? item.paciente : null;

    // Add debug log to check the photo path structure
    if (pacienteInfo && pacienteInfo.foto_perfil) {
      console.log('Patient photo path:', pacienteInfo.foto_perfil);
    }

    // Determine the correct base URL based on platform
    const BASE_URL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : 'http://192.168.0.2:8000';
    
    // Process the photo path to ensure it's in the correct format - directly construct the URL
    const getPhotoUrl = (photoPath) => {
      // Use default image if no photo path
      if (!photoPath) {
        return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
      }
      
      // Extract just the filename (most reliable approach)
      const filename = photoPath.split('/').pop();
      
      // Construct the full URL with the correct path pattern
      const fullUrl = `${BASE_URL}/media/fotos/${filename}`;
      console.log('🔗 Using profile image URL:', fullUrl);
      
      return fullUrl;
    };

    const screenWidth = Dimensions.get('window').width;
    const isMobile = screenWidth < 768;

    return (
      <Card style={[styles.recordCard, isMobile && styles.registroCardMobile]}>
        <Card.Content>
          {/* Add patient info section with photo when in caregiver mode */}
          {userData.role === 'cuidador' && pacienteInfo && (
            <View style={[styles.pacienteInfoContainer, isMobile && styles.pacienteInfoContainerMobile]}>
              {/* Use the WebImage component for web platform */}
              {Platform.OS === 'web' ? (
                <WebImage
                  source={{ 
                    uri: getProfileImageUrl(pacienteInfo.foto_perfil)
                  }}
                  style={styles.pacienteImage}
                />
              ) : (
                <Image
                  source={{ 
                    uri: getProfileImageUrl(pacienteInfo.foto_perfil)
                  }}
                  style={styles.pacienteImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.pacienteDetails}>
                <Text style={styles.pacienteNombre} numberOfLines={1}>
                  {pacienteInfo.nombre || 'Paciente'}
                </Text>
                {pacienteInfo.rut && (
                  <Text style={styles.pacienteRut} numberOfLines={1}>
                    RUT: {pacienteInfo.rut}
                  </Text>
                )}
              </View>
            </View>
          )}
          <Text style={styles.alimentoNombre}>{alimento.nombre}</Text>
          
          {/* Mostrar la unidad de medida de manera más prominente */}
          <View style={styles.unidadContainer}>
            <MaterialIcons name="straighten" size={16} color="#690B22" />
            <Text style={styles.unidadText}>
              {unidad ? unidad.nombre : 'Valor por defecto (100 ml/gr)'}
            </Text>
          </View>
          
          <View style={styles.alimentoInfo}>
            <View style={styles.alimentoDatos}>
              {/* Añadir sección para mostrar todos los valores nutricionales importantes */}
              <View style={styles.nutrientGrid}>
                <View style={styles.nutrientGridItem}>
                  <MaterialIcons name="local-fire-department" size={16} color="#FF9800" />
                  <Text style={styles.nutrientGridLabel}>Calorías:</Text>
                  <Text style={styles.nutrientGridValue}>{adjusted.energia} kcal</Text>
                </View>
                
                <View style={styles.nutrientGridItem}>
                  <View style={[styles.nutrientIndicator, { backgroundColor: sodioColor }]} />
                  <Text style={styles.nutrientGridLabel}>Sodio:</Text>
                  <Text style={styles.nutrientGridValue}>{adjusted.sodio} mg</Text>
                </View>
                
                <View style={styles.nutrientGridItem}>
                  <View style={[styles.nutrientIndicator, { backgroundColor: potasioColor }]} />
                  <Text style={styles.nutrientGridLabel}>Potasio:</Text>
                  <Text style={styles.nutrientGridValue}>{adjusted.potasio} mg</Text>
                </View>
                
                <View style={styles.nutrientGridItem}>
                  <View style={[styles.nutrientIndicator, { backgroundColor: fosforoColor }]} />
                  <Text style={styles.nutrientGridLabel}>Fósforo:</Text>
                  <Text style={styles.nutrientGridValue}>{adjusted.fosforo} mg</Text>
                </View>
              </View>
            </View>
          </View>
          
          <Text style={styles.fechaConsumo}>
            {formatDate(item.fecha_consumo)}
          </Text>
          
          {item.notas && (
            <Text style={styles.notasTexto}>Notas: {item.notas}</Text>
          )}
        </Card.Content>
      </Card>
    );
  };
  
  const toggleCalendarView = () => {
    setCalendarView(prev => prev === 'week' ? 'month' : 'week');
  };
  
  // Custom week view rendering
  const renderWeekCalendar = () => {
    return (
      <View style={styles.weekCalendarContainer}>
        <View style={styles.weekDaysRow}>
          {weekDates.map((dateInfo) => {
            const isSelected = selectedDate === dateInfo.dateString;
            const isMarked = markedDates[dateInfo.dateString]?.marked;
            
            return (
              <TouchableOpacity 
                key={dateInfo.dateString}
                style={[
                  styles.weekDay,
                  isSelected && styles.selectedWeekDay,
                  dateInfo.isToday && styles.todayWeekDay
                ]}
                onPress={() => setSelectedDate(dateInfo.dateString)}
              >
                <Text style={[
                  styles.weekDayName, 
                  isSelected && styles.selectedWeekDayText
                ]}>
                  {dateInfo.dayName}
                </Text>
                <Text style={[
                  styles.weekDayNumber,
                  isSelected && styles.selectedWeekDayText,
                  dateInfo.isToday && styles.todayWeekDayText
                ]}>
                  {dateInfo.day}
                </Text>
                {isMarked && (
                  <View style={[
                    styles.dotMarker,
                    isSelected && styles.selectedDotMarker
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando registros...</Text>
      </View>
    );
  }

  // En el render principal, si el usuario es cuidador y no se ha seleccionado paciente
  if (userData && userData.role === 'cuidador' && !selectedPatientId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.instructionContainer}>
          <Text style={styles.linkedPatientsTitle}>
            Seleccione un paciente para ver sus registros alimentarios:
          </Text>
          
          {linkedPatients.length > 0 ? (
            <View style={styles.linkedPatientsContainer}>
              {linkedPatients.map((patient, index) => {
                // Simplificar la extracción de datos
                const name = patient.nombre || "Paciente sin nombre";
                const age = patient.edad || "N/A";
                const gender = patient.genero || "No especificado";
                const id = patient.paciente_id || patient.id || `patient_${index}`;
                
                return (
                  <TouchableOpacity 
                    key={index.toString()}
                    style={styles.patientCard}
                    onPress={() => setSelectedPatientId(id)}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={{ 
                        uri: getImageUrl(
                          patient.foto_perfil,
                          'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                        )
                      }}
                      style={styles.patientCardImage}
                      resizeMode="cover"
                    />
                    <View style={styles.simpleCardInfo}>
                      <Text style={styles.simpleCardName}>{name}</Text>
                      <Text style={styles.simpleCardDetail}>Edad: {age} años</Text>
                      <Text style={styles.simpleCardDetail}>Género: {gender}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#690B22" style={{opacity: 0.7}} />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.noLinkedPatientsContainer}>
              <MaterialIcons name="people" size={48} color="#690B22" />
              <Text style={styles.noLinkedPatientsText}>
                No tiene pacientes vinculados. Vincule pacientes desde la pantalla de Ficha Médica.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Modificar el renderizado principal para usar un layout diferente en web
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        key={`registros-list-${Platform.OS === 'web' ? 'web' : 'mobile'}`} // Add key that changes with platform
        data={selectedDate ? registrosFiltrados : []}
        keyExtractor={(item) => item.id}
        renderItem={renderRegistroItem}
        ListHeaderComponent={
          <>
            <View style={styles.calendarSection}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>
                  {calendarView === 'week' ? 'Vista Semanal' : 'Vista Mensual'}
                </Text>
                <TouchableOpacity 
                  style={styles.calendarToggle}
                  onPress={toggleCalendarView}
                >
                  <MaterialIcons 
                    name={calendarView === 'week' ? 'calendar-month' : 'view-week'} 
                    size={22} 
                    color="#690B22" 
                  />
                  <Text style={styles.calendarToggleText}>
                    {calendarView === 'week' ? 'Ver Mes' : 'Ver Semana'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {calendarView === 'week' ? (
                renderWeekCalendar()
              ) : (
                <View style={styles.monthCalendarContainer}>
                  <Calendar
                    onDayPress={(day: any) => setSelectedDate(day.dateString)}
                    markedDates={{
                      ...markedDates,
                      [selectedDate || '']: {
                        selected: true,
                        selectedColor: '#690B22',
                        marked: markedDates[selectedDate || '']?.marked || false,
                        dotColor: 'white'
                      }
                    }}
                    theme={{
                      calendarBackground: '#FFFFFF',
                      textSectionTitleColor: '#1B4D3E',
                      selectedDayBackgroundColor: '#690B22',
                      selectedDayTextColor: '#FFFFFF',
                      todayTextColor: '#E07A5F',
                      dayTextColor: '#333333',
                      arrowColor: '#690B22',
                      monthTextColor: '#1B4D3E',
                      textMonthFontWeight: 'bold',
                      textDayFontSize: 14,
                      textMonthFontSize: 16,
                    }}
                  />
                </View>
              )}
            </View>
            
            {selectedDate && renderResumenDiario()}
            
            {!selectedDate && (
              <View style={styles.instructionContainer}>
                <MaterialIcons name="calendar-month" size={48} color="#690B22" />
                <Text style={styles.instructionText}>Seleccione una fecha para ver sus registros</Text>
              </View>
            )}
            
            {/* Añadir un título para la sección de alimentos cuando hay registros */}
            {selectedDate && registrosFiltrados.length > 0 && (
              <View style={styles.registrosHeader}>
                <Text style={styles.registrosTitle}>Alimentos consumidos</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          selectedDate ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="no-meals" size={48} color="#690B22" />
              <Text style={styles.emptyText}>No hay registros para esta fecha</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchRegistros}
            >
              <MaterialIcons name="refresh" size={22} color="#FFFFFF" />
              <Text style={styles.refreshButtonText}>Actualizar registros</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={[
          styles.contentContainer,
          // Si no hay datos, permitir que el contenedor ocupe todo el espacio disponible
          registrosFiltrados.length === 0 && styles.emptyListContent,
          // En web, usar un layout flexible para mostrar los alimentos en filas
          Platform.OS === 'web' && styles.webGridContainer
        ]}
        // En web, no usar columnas pero ajustar el contenedor con flex-wrap
        // En móvil, mantener el layout vertical
        numColumns={1}
        columnWrapperStyle={undefined}
      />
      <TouchableOpacity
        style={styles.registrarConsumoButton}
        onPress={() => navigation.navigate('AlimentosScreen')}
      >
        <View style={styles.registrarButtonContent}>
          <MaterialIcons name="add-circle" size={22} color="#FFFFFF" />
          <Text style={styles.registrarConsumoText}>Registrar consumo</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  // Separate calendar section
  calendarSection: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
      },
    }),
  },
  // Content section (day summary and food list)
  contentSection: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  calendarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  calendarToggleText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#690B22',
    fontWeight: '500',
  },
  // Week calendar specific styles
  weekCalendarContainer: {
    padding: 10,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedWeekDay: {
    backgroundColor: '#690B22',
  },
  todayWeekDay: {
    backgroundColor: 'rgba(224, 122, 95, 0.1)',
    borderWidth: 1,
    borderColor: '#E07A5F',
  },
  weekDayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  selectedWeekDayText: {
    color: '#FFFFFF',
  },
  todayWeekDayText: {
    color: '#E07A5F',
  },
  dotMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#690B22',
    marginTop: 3,
  },
  selectedDotMarker: {
    backgroundColor: '#FFFFFF',
  },
  // Month calendar specific styles
  monthCalendarContainer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  // Rest of existing styles
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
  resumenCard: {
    margin: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0,0,0,0.15)',
      },
    }),
  },
  resumenContent: {
    padding: 10, // Reduced padding
  },
  resumenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumenTitle: {
    fontSize: 16,  // Smaller font size
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  resumenSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  resumenStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,  // Reduced from 20
    fontWeight: 'bold',
    color: '#690B22',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    height: 25,
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#E0E0E0',
  },
  alimentosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 5,
  },
  alimentoCard: {
    margin: 10,
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#690B22',
  },
  alimentoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  alimentoInfo: {
    marginVertical: 4,
  },
  alimentoDatos: {
    backgroundColor: '#fafafa',
    padding: 8,
    borderRadius: 6,
  },
  alimentoInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  fechaConsumo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  notasTexto: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  instructionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'center',
    marginTop: 10,
  },
  refreshButton: {
    backgroundColor: '#690B22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 10,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // New styles for nutrient indicators
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  
  nutrientValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  nutrientIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  imagenCard:{
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  patientDetail: {
    fontSize: 16,
    color: '#555',
    marginVertical: 2,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    // Para web puede tener un ancho fijo, en móvil usa ancho completo
    width: Platform.OS === 'web' ? 'calc(33.333% - 20px)' : '100%', // Aproximadamente 3 columnas en web con margen
    minWidth: Platform.OS === 'web' ? 300 : undefined, // Ancho mínimo para evitar tarjetas muy estrechas
    maxWidth: Platform.OS === 'web' ? 400 : undefined, // Ancho máximo para consistencia
    margin: Platform.OS === 'web' ? 10 : undefined, // Margen uniforme
    flexGrow: Platform.OS === 'web' ? 0 : undefined, // No crecer más allá del ancho establecido
    marginHorizontal: Platform.OS === 'web' ? undefined : 10, // Mantener margen horizontal en móvil
    // Sombras consistentes entre plataformas
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  infoCard: {
    backgroundColor: Platform.OS === 'web' ? '#fff' : '#EFEFEF', // Fondo gris suave en móvil
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unidadText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  nutritionText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  // Nuevos estilos para las alertas
  warningIcon: {
    marginTop: 2,
  },
  
  dailyWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  
  dailyWarningText: {
    fontSize: 12,
    color: '#D32F2F',
    marginLeft: 6,
    flex: 1,
  },
  
  // Modificación en resumenStats para acomodar un nutriente más
  resumenStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  footerContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  
  // Estilo para cuando la lista está vacía, para que el contenido se centre mejor
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  // Contenedor de grid para web
  webGridContainer: {
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      maxWidth: 1200, // Limitar ancho máximo en pantallas grandes
      marginHorizontal: 'auto', // Centrar el contenedor en web
    }),
  },
  
  // Título para la sección de registros
  registrosHeader: {
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  
  registrosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  // Estilos mejorados para la unidad de medida
  unidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  
  unidadText: {
    fontSize: 14,
    color: '#690B22',
    fontWeight: '500',
    marginLeft: 6,
  },
  
  // Estilos para la cuadrícula de nutrientes
  nutrientGrid: {
    marginTop: 6,
    marginBottom: 4,
  },
  
  nutrientGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  
  nutrientGridLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: 'bold',
    marginLeft: 6,
    width: 70, // Ancho fijo para alinear todos los valores
  },
  
  nutrientGridValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontWeight: '500',
  },
  resumenSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  infoButton: {
    marginLeft: 8,
    padding: 4,
  },
  
  rangeText: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  registrarConsumoButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 15,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: '90%',
    maxWidth: 500,
  },
  registrarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registrarConsumoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  registroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  pacienteInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F0E8',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pacienteImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  pacienteDetails: {
    flex: 1,
  },
  pacienteNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  pacienteRut: {
    fontSize: 12,
    color: '#666',
  },
  registroInfoContainer: {
    padding: 12,
  },
  registroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  alimentoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    flex: 1,
    marginRight: 10,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fechaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  nutrientesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nutrienteItem: {
    backgroundColor: '#F1E3D3',
    padding: 8,
    borderRadius: 6,
    width: '30%',
    marginBottom: 5,
    alignItems: 'center',
  },
  nutrienteLabel: {
    fontSize: 12,
    color: '#1B4D3E',
    marginBottom: 2,
  },
  nutrienteValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#690B22',
  },
  notasContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 4,
    marginBottom: 10,
  },
  notasText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  viewButton: {
    backgroundColor: '#0288D1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Enhanced mobile styles for patient cards
  registroCardMobile: {
    marginHorizontal: 10,
    padding: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  pacienteInfoContainerMobile: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  // Estilos mejorados para la selección de pacientes
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 20,
    textAlign: 'center',
  },
  patientListContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 3px 8px rgba(0,0,0,0.12)',
      },
    }),
  },
  
  patientCardImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: '#F1E3D3',
    borderWidth: 2,
    borderColor: '#F8E8D8',
  },
  
  patientCardInfo: {
    flex: 1,
    paddingVertical: 4,
  },
  
  patientCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  
  patientCardDetail: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  
  noLinkedPatientsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 3px 8px rgba(0,0,0,0.12)',
      },
    }),
  },
  
  noLinkedPatientsText: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
  
  // Estilos específicos para la versión móvil de las tarjetas de pacientes
  patientCardMobile: {
    padding: 12,
    marginVertical: 6,
    borderWidth: 2, // Borde más pronunciado para mejor visualización
  },
  
  patientInfoMobile: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    borderWidth: 0, // Quitar bordes para depuración
    borderRadius: 4,
  },
  
  patientNameMobile: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000', // Color negro para máximo contraste
    marginBottom: 4,
    letterSpacing: 0.3, // Mejor legibilidad
  },
  
  patientDetailMobile: {
    fontSize: 14,
    color: '#333333', // Color oscuro para mejor contraste
    marginBottom: 2,
    letterSpacing: 0.2, // Mejor legibilidad
  },
  
  // ...existing code...
  simpleCardInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  
  simpleCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  
  simpleCardDetail: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 3,
  },
  
  // Ajustar el estilo de la tarjeta para que sea más simple y confiable
  patientCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
      },
    }),
  },
  
  patientCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0', // Color de fondo mientras carga
  },
  
  // ...existing code...
});
