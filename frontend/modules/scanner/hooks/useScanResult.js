import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function useScanResult(route) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const navigation = useNavigation();
  
  // Extraer el URI de la imagen de los parámetros de ruta
  const imageUri = route?.params?.imageUri;

  // Simular que estamos obteniendo resultados del análisis
  useEffect(() => {
    if (!imageUri) {
      setLoading(false);
      return;
    }
    
    // Simular tiempo de procesamiento
    const timer = setTimeout(() => {
      // Datos de ejemplo para simular resultados de escaneo
      const mockResults = {
        alimento: {
          nombre: "Manzana roja",
          calorias: 52,
          clasificacion: "Fruta",
          propiedades: [
            "Bajo en sodio",
            "Sin colesterol",
            "Alto en fibra"
          ],
          recomendacion: "Compatible con una dieta renal. Consumo moderado recomendado."
        }
      };
      
      setResults(mockResults);
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [imageUri]);

  // Función para volver a la pantalla de escaneo
  const handleScanAgain = () => {
    navigation.navigate('QRScanner');
  };
  
  // Función para volver a la pantalla principal
  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  return {
    loading,
    results,
    imageUri,
    handleScanAgain,
    handleGoHome
  };
}
