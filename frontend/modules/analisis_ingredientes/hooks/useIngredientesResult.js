import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../config/apiConfig';

export default function useIngredientesResult(route) {
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
  
  // Estados específicos para ingredientes
  const [ingredientesDetectados, setIngredientesDetectados] = useState([]);
  const [ingredientesRiesgo, setIngredientesRiesgo] = useState([]);
  const [recomendacion, setRecomendacion] = useState("");
  const [esRecomendado, setEsRecomendado] = useState(null);
  const [nombreProducto, setNombreProducto] = useState("");
  
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
  
  // Procesar los resultados
  useEffect(() => {
    if (results) {
      // Extraer la información de los resultados
      setIngredientesDetectados(results.ingredientes_detectados || []);
      setIngredientesRiesgo(results.ingredientes_riesgo || []);
      setRecomendacion(results.recomendacion || "");
      setEsRecomendado(results.es_recomendado || false);
      setNombreProducto(results.nombre_producto || "Producto no identificado");
    }
  }, [results]);

  // Función para volver a escanear
  const handleScanAgain = () => {
    navigation.navigate('IngredientesAlimentos');
  };
  
  // Función para volver a la pantalla principal
  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  // Función para ver más información sobre un ingrediente
  const handleVerMasIngrediente = (ingrediente) => {
    // Aquí podría navegar a una pantalla de detalle o mostrar un modal
    console.log('Ver más info sobre:', ingrediente);
  };

  return {
    loading,
    error,
    results,
    imageUri,
    serverImageUrl,
    ingredientesDetectados,
    ingredientesRiesgo,
    recomendacion,
    esRecomendado,
    nombreProducto,
    handleScanAgain,
    handleGoHome,
    handleVerMasIngrediente
  };
}
