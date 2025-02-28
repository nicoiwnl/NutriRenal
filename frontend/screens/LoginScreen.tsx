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

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombres: '',
    apellidos: '',
    edad: '',
    genero: '',
    alergias: '',
  });
  const navigation = useNavigation();  
  const handleSubmit = async () => {
    if (isLogin) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://api.a0.dev/assets/image?text=abstract%20medical%20background%20with%20soft%20burgundy%20and%20beige%20colors%20professional%20medical&aspect=9:16' }}
        style={styles.backgroundImage}>
        <LinearGradient
          colors={['rgba(241,227,211,0.95)', 'rgba(241,227,211,0.85)']}
          style={styles.gradient}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled">
            <View style={styles.loginContainer}>
              <View style={styles.logoContainer}>
                <MaterialIcons name="health-and-safety" size={60} color="#690B22" />
              </View>
              <Text style={styles.title}>NutriRenal</Text>
              <Text style={styles.subtitle}>Control Nutricional IRC</Text>

              <View style={styles.toggleContainer}>
                <TouchableOpacity 
                  style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                  onPress={() => setIsLogin(true)}>
                  <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Iniciar Sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                  onPress={() => setIsLogin(false)}>
                  <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Registro</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={24} color="#690B22" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#666"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={24} color="#690B22" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#666"
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                  secureTextEntry
                />
              </View>

              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="person" size={24} color="#690B22" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nombres"
                      placeholderTextColor="#666"
                      value={formData.nombres}
                      onChangeText={(text) => setFormData({...formData, nombres: text})}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialIcons name="person" size={24} color="#690B22" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Apellidos"
                      placeholderTextColor="#666"
                      value={formData.apellidos}
                      onChangeText={(text) => setFormData({...formData, apellidos: text})}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialIcons name="cake" size={24} color="#690B22" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Edad"
                      placeholderTextColor="#666"
                      value={formData.edad}
                      onChangeText={(text) => setFormData({...formData, edad: text})}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialIcons name="wc" size={24} color="#690B22" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Género"
                      placeholderTextColor="#666"
                      value={formData.genero}
                      onChangeText={(text) => setFormData({...formData, genero: text})}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialIcons name="warning" size={24} color="#690B22" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Alergias"
                      placeholderTextColor="#666"
                      value={formData.alergias}
                      onChangeText={(text) => setFormData({...formData, alergias: text})}
                      multiline
                    />
                  </View>
                </>
              )}

              <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
                <Text style={styles.loginButtonText}>
                  {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                </Text>
              </TouchableOpacity>

              {isLogin && (
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: Platform.OS === 'web' ? '100%' : '90%',
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
    marginVertical: Platform.select({ ios: 30, android: 40 }), // mayor separación vertical en móviles
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#F1E3D3',
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#690B22',
  },
  toggleText: {
    color: '#1B4D3E',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#F1E3D3',
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
  loginButton: {
    backgroundColor: '#690B22',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#F1E3D3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#1B4D3E',
    fontSize: 14,
  },
});