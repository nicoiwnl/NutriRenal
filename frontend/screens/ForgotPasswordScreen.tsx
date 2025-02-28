import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();  const handleResetPassword = async () => {
    try {
      if (!email) {
        toast.error('Por favor ingrese su correo electrónico');
        return;
      }
      
      await authService.forgotPassword(email);
      toast.success('Se ha enviado un correo con las instrucciones');
      navigation.navigate('Login');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Error al enviar el correo');
      } else {
        toast.error('Error al procesar la solicitud');
      }
    }
  };  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}>
      <ImageBackground
        source={{ uri: 'https://api.a0.dev/assets/image?text=abstract%20medical%20background%20with%20soft%20burgundy%20and%20beige%20colors%20professional%20medical&aspect=9:16' }}
        style={styles.backgroundImage}>
        <LinearGradient
          colors={['rgba(241,227,211,0.95)', 'rgba(241,227,211,0.85)']}
          style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.navigate('Login')}>
                <MaterialIcons name="arrow-back" size={24} color="#690B22" />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <MaterialIcons name="health-and-safety" size={60} color="#690B22" />
              </View>

              <Text style={styles.title}>Recuperar Contraseña</Text>
              <Text style={styles.subtitle}>
                Ingresa tu correo electrónico y te enviaremos las instrucciones
              </Text>

              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={24} color="#690B22" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleResetPassword}>
                <Text style={styles.resetButtonText}>Enviar Instrucciones</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: Platform.OS === 'web' ? '100%' : undefined,
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }
    }),
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#1B4D3E',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E07A5F',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#1B4D3E',
  },
  resetButton: {
    backgroundColor: '#690B22',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#F1E3D3',
    fontSize: 16,
    fontWeight: 'bold',
  },
});