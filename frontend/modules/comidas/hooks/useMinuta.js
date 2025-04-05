import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '../../../api';

export default function useMinuta() {
  const [loading, setLoading] = useState(true);
  const [minutas, setMinutas] = useState([]);
  const [selectedMinuta, setSelectedMinuta] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMinutas();
  }, []);

  const fetchMinutas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener ID de persona del usuario actual
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        setError('No se pudo identificar al usuario');
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
      setError('No se pudieron cargar las minutas nutricionales');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMinuta = (minuta) => {
    setSelectedMinuta(minuta);
  };

  const handlePrintMinuta = () => {
    Alert.alert(
      'Imprimir Minuta', 
      'Esta función enviará la minuta a su impresora o generará un PDF para imprimir.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => console.log('Imprimiendo minuta...') }
      ]
    );
  };

  return {
    loading,
    minutas,
    selectedMinuta,
    error,
    handleSelectMinuta,
    handlePrintMinuta,
    refreshMinutas: fetchMinutas
  };
}
