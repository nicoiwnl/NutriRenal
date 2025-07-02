import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api from '../../../api';
import { BASE_URL } from '../../../config/apiConfig';

export default function useScanResult(route) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  
  // Extraer datos de los parámetros de ruta
  const imageUri = route?.params?.imageUri;
  const results = route?.params?.results || null;
  
  // Estado para almacenar el perfil médico del usuario
  const [perfilMedico, setPerfilMedico] = useState(null);
  // Estado para almacenar la URL de imagen guardada en el servidor
  const [serverImageUrl, setServerImageUrl] = useState(null);
  // Añadir estado para umbrales
  const [thresholds, setThresholds] = useState({
    sodio: 500,
    potasio: 500,
    fosforo: 300
  });
  
  // Determinar URL completa para la imagen del servidor
  useEffect(() => {
    if (results && results.imagen_analizada) {
      const mediaUrl = `${BASE_URL}/media/`;
      
      setServerImageUrl(`${mediaUrl}${results.imagen_analizada}`);
      console.log('URL de imagen guardada:', `${mediaUrl}${results.imagen_analizada}`);
    }
  }, [results]);
  
  // Función para cargar el perfil médico
  useEffect(() => {
    const cargarPerfilMedico = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const userDataObj = JSON.parse(userData);
          if (userDataObj.perfil_medico) {
            setPerfilMedico(userDataObj.perfil_medico);
          }
        }
      } catch (error) {
        console.error('Error al cargar perfil médico:', error);
      }
    };
    
    cargarPerfilMedico();
  }, []);
  
  // Cargar umbrales del perfil de usuario o de la configuración predeterminada
  useEffect(() => {
    const loadThresholds = async () => {
      try {
        // Intentar obtener umbrales del perfil o configuración
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const userDataObj = JSON.parse(userData);
          if (userDataObj.perfil_medico && userDataObj.perfil_medico.restricciones) {
            // Si el usuario tiene perfil médico con restricciones, usar esos valores
            const restricciones = userDataObj.perfil_medico.restricciones;
            setThresholds({
              sodio: restricciones.sodio_max || 375,
              potasio: restricciones.potasio_max || 500,
              fosforo: restricciones.fosforo_max || 250
            });
          } else {
            // Establecer los nuevos valores predeterminados si no hay restricciones de perfil de usuario
            setThresholds({
              sodio: 375,
              potasio: 500,
              fosforo: 250
            });
          }
        }
      } catch (error) {
        console.error('Error al cargar umbrales:', error);
      }
    };
    
    loadThresholds();
  }, []);
  
  // Evaluar la compatibilidad de los alimentos detectados con el perfil médico
  const evaluarCompatibilidad = (alimentosDetectados, perfil) => {
    if (!perfil || !alimentosDetectados) return {};
    
    // Analizar los totales nutricionales
    const totales = results.totales;
    
    // Use loaded thresholds instead of hardcoded values
    const compatibilidadInfo = {
      sodio: {
        valor: totales.sodio,
        compatible: totales.sodio < thresholds.sodio,
        mensaje: totales.sodio < thresholds.sodio ? 
          'Nivel de sodio aceptable' : 
          'Nivel de sodio elevado para tu condición'
      },
      potasio: {
        valor: totales.potasio,
        compatible: totales.potasio < thresholds.potasio,
        mensaje: totales.potasio < thresholds.potasio ? 
          'Nivel de potasio aceptable' : 
          'Nivel de potasio elevado para tu condición'
      },
      fosforo: {
        valor: totales.fosforo,
        compatible: totales.fosforo < thresholds.fosforo,
        mensaje: totales.fosforo < thresholds.fosforo ? 
          'Nivel de fósforo aceptable' : 
          'Nivel de fósforo elevado para tu condición'
      }
    };
    
    return compatibilidadInfo;
  };

  // Función para registrar el consumo de un alimento detectado
  const registrarConsumo = async (alimento) => {
    // Esta función podría implementarse para guardar el consumo en la BD
    console.log('Registrar consumo de:', alimento.nombre);
  };

  // Función para volver a escanear
  const handleScanAgain = () => {
    // Navigate back to the QRScanner tab within Home
    navigation.navigate('Home', { screen: 'QRScanner' });
  };
  
  // Función para volver a la pantalla principal
  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  // Calcular compatibilidad cuando tenemos resultados y perfil
  const compatibilidad = results && perfilMedico ? 
    evaluarCompatibilidad(results.alimentos_detectados, perfilMedico) : 
    null;

  return {
    loading,
    error,
    results,
    imageUri,
    serverImageUrl,  // URL de la imagen almacenada en el servidor
    compatibilidad,
    handleScanAgain,
    handleGoHome,
    registrarConsumo
  };
}
