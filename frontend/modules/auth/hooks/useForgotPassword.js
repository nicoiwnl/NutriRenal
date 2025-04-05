import { useState } from 'react';
import { Alert } from 'react-native';
import api from '../../../api';

export default function useForgotPassword(navigation) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingrese su correo electrónico');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Por favor ingrese un correo electrónico válido');
      return;
    }
    
    setLoading(true);
    
    try {
      // Aquí debería ir la lógica real de solicitud de recuperación de contraseña
      // Por ahora simulamos una espera y un éxito
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Correo Enviado',
        'Se ha enviado un correo con instrucciones para restablecer su contraseña.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error);
      Alert.alert('Error', 'No se pudo procesar su solicitud. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };
  
  return {
    email,
    setEmail,
    loading,
    handleResetPassword,
    handleBackToLogin
  };
}
