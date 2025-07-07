import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Componentes y hooks del módulo de autenticación
import ForgotPasswordForm from '../modules/auth/components/ForgotPasswordForm';
import BackButton from '../modules/auth/components/BackButton';
import useForgotPassword from '../modules/auth/hooks/useForgotPassword';
import styles from '../modules/auth/styles/forgotPasswordStyles';
import Logo from '../assets/images/logo-sinfondo.png';

export default function ForgotPasswordScreen({ navigation }) {
  // Obtener estado y funciones del hook personalizado
  const {
    email,
    setEmail,
    loading,
    handleResetPassword,
    handleBackToLogin
  } = useForgotPassword(navigation);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F1E3D3', '#F8E8D8']}
        style={styles.gradient}
      >
        <BackButton 
          onPress={handleBackToLogin} 
          style={styles.backButton} 
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              <View style={styles.logoContainer}>
                {/* Usar un texto como logo temporalmente */}
                <Image
                  source={Logo}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={styles.title}>Recuperar Contraseña</Text>
              <Text style={styles.subtitle}>
                Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su contraseña
              </Text>
              
              <ForgotPasswordForm
                email={email}
                setEmail={setEmail}
                onSubmit={handleResetPassword}
                loading={loading}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}