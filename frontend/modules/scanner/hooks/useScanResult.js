import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api from '../../../api';

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
  
  // Determinar URL completa para la imagen del servidor
  useEffect(() => {
    if (results && results.imagen_analizada) {
      const baseUrl = Platform.OS === 'web' 
        ? 'http://127.0.0.1:8000/media/'
        : 'http://192.168.1.24:8000/media/';
      
      setServerImageUrl(`${baseUrl}${results.imagen_analizada}`);
      console.log('URL de imagen guardada:', `${baseUrl}${results.imagen_analizada}`);
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
  
  // Evaluar la compatibilidad de los alimentos detectados con el perfil médico
  const evaluarCompatibilidad = (alimentosDetectados, perfil) => {
    if (!perfil || !alimentosDetectados) return {};
    
    // Analizar los totales nutricionales
    const totales = results.totales;
    
    // Implementar lógica de compatibilidad según perfil médico
    // Esta es una implementación básica que se puede expandir
    const compatibilidadInfo = {
      sodio: {
        valor: totales.sodio,
        compatible: totales.sodio < 500, // Valor ejemplo
        mensaje: totales.sodio < 500 ? 
          'Nivel de sodio aceptable' : 
          'Nivel de sodio elevado para tu condición'
      },
      potasio: {
        valor: totales.potasio,
        compatible: totales.potasio < 500, // Valor ejemplo
        mensaje: totales.potasio < 500 ? 
          'Nivel de potasio aceptable' : 
          'Nivel de potasio elevado para tu condición'
      },
      fosforo: {
        valor: totales.fosforo,
        compatible: totales.fosforo < 300, // Valor ejemplo
        mensaje: totales.fosforo < 300 ? 
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
    navigation.navigate('QRScanner');
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
