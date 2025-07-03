import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';
import caregiverService from '../../../services/caregiverService';
import { getImageUrl, getProfileImageUrl } from '../../../utils/imageHelper';

export default function useRegistros(navigation) {
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [calendarView, setCalendarView] = useState('week');
  const [userData, setUserData] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [linkedPatients, setLinkedPatients] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  
  // Format date in Spanish (e.g., "18 de marzo 2025")
  const formatDateInSpanish = (dateInput) => {
    let date;
    
    if (typeof dateInput === 'string') {
      const [year, month, day] = dateInput.split('-').map(num => parseInt(num, 10));
      date = new Date(year, month - 1, day, 12, 0, 0);
    } else {
      date = new Date(dateInput);
    }
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  
  // Get the current week's dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    monday.setDate(diff);
    
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
      const persona_id = (userData.role === 'cuidador' && selectedPatientId)
        ? selectedPatientId
        : userData.persona_id;
      const response = await api.get(`/registros-comida/?id_persona=${persona_id}`);
      
      const registrosConDetalles = await Promise.all(
        response.data.map(async (registro) => {
          try {
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
      
      setRegistros(registrosConDetalles);
      
      // Marcar fechas en el calendario
      const fechasRegistradas = {};
      registrosConDetalles.forEach(registro => {
        const fecha = registro.fecha_consumo.split('T')[0];
        fechasRegistradas[fecha] = {
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
  
  useEffect(() => {
    if (userData && (userData.role !== 'cuidador' || selectedPatientId)) {
      fetchRegistros();
    }
  }, [selectedPatientId]);
  
  // Load linked patients for caregiver
  const loadLinkedPatients = async () => {
    try {
      setLoading(true);
      const patients = await caregiverService.getPatientsList(userData.persona_id);
      setLinkedPatients(patients);
    } catch (error) {
      console.error("Error loading linked patients: ", error);
    } finally {
      setLoading(false);
    }
  };

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
        const units = response.data.map((unit) => ({
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
  const computeAdjustedValues = (alimento, unidad) => {
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
    
    // Primero filtramos los registros por la fecha seleccionada
    const filtrados = registros.filter((registro) => {
      const fechaRegistro = new Date(registro.fecha_consumo);
      const year = fechaRegistro.getFullYear();
      const month = String(fechaRegistro.getMonth() + 1).padStart(2, '0');
      const day = String(fechaRegistro.getDate()).padStart(2, '0');
      const fechaRegistroLocal = `${year}-${month}-${day}`;
      return fechaRegistroLocal === selectedDate;
    });
    
    // Luego ordenamos los registros filtrados por fecha de más reciente a más antiguo
    return filtrados.sort((a, b) => {
      const fechaA = new Date(a.fecha_consumo).getTime();
      const fechaB = new Date(b.fecha_consumo).getTime();
      return fechaB - fechaA; // Orden descendente (más reciente primero)
    });
  }, [selectedDate, registros]);

  // Calcular totales nutricionales para la fecha seleccionada
  const totalesDiarios = useMemo(() => {
    if (!registrosFiltrados.length) return { calorias: 0, fosforo: 0, sodio: 0, potasio: 0 };
    
    return registrosFiltrados.reduce((acc, registro) => {
      const alimento = registro.detalleAlimento;
      if (!alimento) return acc;
      
      const unidadMedida = unidadesMedida.find(u => u.id === registro.unidad_medida);
      
      let factorConversion = 1;
      if (unidadMedida) {
        if (unidadMedida.es_volumen && unidadMedida.equivalencia_ml) {
          factorConversion = Number(unidadMedida.equivalencia_ml) / 100;
        } else if (!unidadMedida.es_volumen && unidadMedida.equivalencia_g) {
          factorConversion = Number(unidadMedida.equivalencia_g) / 100;
        }
      }
      
      if (isNaN(factorConversion) || factorConversion <= 0) {
        factorConversion = 1;
      }
      
      return {
        calorias: acc.calorias + ((parseFloat(alimento.energia) || 0) * factorConversion),
        fosforo: acc.fosforo + ((parseFloat(alimento.fosforo) || 0) * factorConversion),
        sodio: acc.sodio + ((parseFloat(alimento.sodio) || 0) * factorConversion),
        potasio: acc.potasio + ((parseFloat(alimento.potasio) || 0) * factorConversion)
      };
    }, { calorias: 0, fosforo: 0, sodio: 0, potasio: 0 });
  }, [registrosFiltrados, unidadesMedida]);
  
  // Formatear fecha de consumo
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Determinar color de nutriente basado en valor
  const getNutrientColor = (nutrient, value) => {
    if (nutrient === 'sodio') {
      if (value > 250) return '#F44336';
      if (value >= 120) return '#FFC107';
      return '#4CAF50';
    } 
    else if (nutrient === 'potasio') {
      if (value > 350) return '#F44336';
      if (value >= 200) return '#FFC107';
      return '#4CAF50';
    }
    else if (nutrient === 'fosforo') {
      if (value > 170) return '#F44336';
      if (value >= 100) return '#FFC107';
      return '#4CAF50';
    }
    return '#9E9E9E';
  };

  // Determinar color del valor basado en los umbrales diarios
  const getNutrientDailyColor = (nutrient, value) => {
    if (nutrient === 'sodio') {
      if (value > 1700) return '#F44336';
      if (value > 1300) return '#FFC107';
      return '#4CAF50';
    } 
    else if (nutrient === 'potasio') {
      if (value > 2000) return '#F44336';
      if (value > 1800) return '#FFC107';
      return '#4CAF50';
    }
    else if (nutrient === 'fosforo') {
      if (value > 1000) return '#F44336';
      if (value > 800) return '#FFC107';
      return '#4CAF50';
    }
    return '#1B4D3E';
  };
  
  const toggleCalendarView = () => {
    setCalendarView(prev => prev === 'week' ? 'month' : 'week');
  };
  
  const onRefresh = () => {
    fetchRegistros();
  };
  
  const navigateToAlimentos = () => {
    // Usar navegación reset más confiable
    navigation.reset({
      index: 0,
      routes: [
        { 
          name: 'Home',
          params: { screen: 'Alimentos' }
        }
      ]
    });
  };

  return {
    loading,
    registros,
    selectedDate,
    setSelectedDate,
    markedDates,
    calendarView,
    userData,
    selectedPatientId,
    setSelectedPatientId,
    linkedPatients,
    weekDates,
    registrosFiltrados,
    totalesDiarios,
    formatDateInSpanish,
    formatDate,
    getNutrientColor,
    getNutrientDailyColor,
    toggleCalendarView,
    onRefresh,
    navigateToAlimentos,
    unidadesMedida // Asegurarse de exponer las unidades de medida
  };
}
