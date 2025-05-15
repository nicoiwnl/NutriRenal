import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  TouchableOpacity, 
  Platform, 
  KeyboardAvoidingView, 
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Módulo de autenticación
import AuthForm from '../modules/auth/components/AuthForm';
import useLogin from '../modules/auth/hooks/useLogin';
import styles from '../modules/auth/styles/loginStyles';

export default function LoginScreen({ navigation }) {
  // Obtener estado y funciones del hook personalizado
  const {
    isLogin,
    setIsLogin,
    loading,
    showDatePicker,
    setShowDatePicker,
    loginMethod,
    setLoginMethod,
    selectedRole,
    setSelectedRole,
    selectedGender,
    setSelectedGender,
    formData,
    setFormData,
    handleDateChange,
    handleSubmit,
    formatDateToDDMMYYYY
  } = useLogin(navigation);

  // Usar un fondo sólido con LinearGradient en lugar de imagen para evitar errores
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F1E3D3', '#F8E8D8']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              {/* Usar un texto como logo temporalmente si no hay imagen */}
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#690B22',
                textAlign: 'center'
              }}>
                NutriRenal
              </Text>
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.title}>
                {isLogin ? 'Iniciar Sesión' : 'Registro'}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin 
                  ? 'Ingrese sus datos para acceder' 
                  : 'Complete el formulario para crear su cuenta'
                }
              </Text>

              {/* Selector de modo (Login / Registro) */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    isLogin && styles.toggleButtonActive
                  ]}
                  onPress={() => setIsLogin(true)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      isLogin && styles.toggleTextActive
                    ]}
                  >
                    Iniciar Sesión
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !isLogin && styles.toggleButtonActive
                  ]}
                  onPress={() => setIsLogin(false)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      !isLogin && styles.toggleTextActive
                    ]}
                  >
                    Registro
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Formulario de login/registro */}
              <AuthForm 
                isLogin={isLogin}
                loginMethod={loginMethod}
                setLoginMethod={setLoginMethod}
                formData={formData}
                setFormData={setFormData}
                selectedGender={selectedGender}
                setSelectedGender={setSelectedGender}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                handleDateChange={handleDateChange}
                handleSubmit={handleSubmit}
                loading={loading}
                formatDateToDDMMYYYY={formatDateToDDMMYYYY}
                navigation={navigation}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}