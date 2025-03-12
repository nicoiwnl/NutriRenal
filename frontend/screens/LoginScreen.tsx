import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatearRut, calcularDigitoVerificador } from '../utils/rutHelper'; // Importar las funciones de RUT
import { getUserRoles, determinePrimaryRole } from '../services/userService';

// Add a function to format the date in DD-MM-YYYY format
const formatDateToDDMMYYYY = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Componente multiplataforma para seleccionar fecha
const CrossPlatformDatePicker = ({ value, onChange, maximumDate }) => {
  const [showPicker, setShowPicker] = useState(false);

  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // En iOS y Android, mostrar el DateTimePicker nativo
    return (
      <>
        {showPicker && (
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (event.type !== 'dismissed' && selectedDate) {
                onChange(selectedDate);
              }
            }}
            maximumDate={maximumDate}
          />
        )}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {value ? formatDateToDDMMYYYY(value) : 'Seleccionar fecha'}
          </Text>
          <MaterialIcons name="calendar-today" size={24} color="#690B22" />
        </TouchableOpacity>
      </>
    );
  } else {
    // En web, usar un input de tipo date
    return (
      <input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          if (e.target.value) {
            onChange(new Date(e.target.value));
          }
        }}
        max={maximumDate ? maximumDate.toISOString().split('T')[0] : undefined}
        style={{
          padding: '12px',
          borderRadius: '8px',
          borderColor: '#E07A5F',
          borderWidth: '1px',
          backgroundColor: '#F1E3D3',
          width: '100%',
          marginBottom: '15px',
          fontSize: '16px',
          color: '#1B4D3E'
        }}
      />
    );
  }
};

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loginMethod, setLoginMethod] = useState('rut'); // Cambiado a 'rut' como método predeterminado
  const [selectedRole, setSelectedRole] = useState('paciente'); // Estado para el rol seleccionado
  const [selectedGender, setSelectedGender] = useState('');  // Estado para controlar el género seleccionado
  const [formData, setFormData] = useState({
    email: '',
    rut: '', // Añadir campo RUT para login
    password: '',
    nombres: '',
    apellidos: '',
    edad: '',
    genero: '',
    fecha_nacimiento: new Date(),
    foto_perfil: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  });
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token:', token); // Log the token
      if (token) {
        navigation.navigate('Home');
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (selectedGender) {
      setFormData(prev => ({
        ...prev,
        genero: selectedGender
      }));
    }
  }, [selectedGender]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.navigate('Login');
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.fecha_nacimiento;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({...formData, fecha_nacimiento: currentDate});
  };
  
  const validateForm = () => {
    if (isLogin) {
      if (loginMethod === 'email') {
        if (!formData.email || !formData.password) {
          Alert.alert('Error', 'Por favor ingrese email y contraseña');
          return false;
        }
        // Validación básica de email
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          Alert.alert('Error', 'Por favor ingrese un email válido');
          return false;
        }
      } else { // loginMethod === 'rut'
        if (!formData.rut || !formData.password) {
          Alert.alert('Error', 'Por favor ingrese RUT y contraseña');
          return false;
        }
        // Validación básica de RUT (solo números)
        if (!/^\d+$/.test(formData.rut)) {
          Alert.alert('Error', 'El RUT debe contener solo números');
          return false;
        }
      }
    } else { // registro
      // Solo validar campos esenciales: email, password y rut
      if (!formData.email || !formData.password || !formData.rut || !formData.nombres || !formData.apellidos) {
        Alert.alert('Error', 'Por favor complete los campos obligatorios: email, contraseña, RUT, nombres y apellidos');
        return false;
      }
      
      // Validación básica de RUT (solo números)
      if (!/^\d+$/.test(formData.rut)) {
        Alert.alert('Error', 'El RUT debe contener solo números');
        return false;
      }
      
      // Validación básica de email
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        Alert.alert('Error', 'Por favor ingrese un email válido');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Prepare login data based on selected method
        const loginData = {
          password: formData.password
        };
        
        // Add email or rut based on selected method
        if (loginMethod === 'email') {
          loginData.email = formData.email;
        } else {
          loginData.rut = formData.rut;
        }
        
        // Send login request
        console.log('Sending login request with:', loginData);
        const response = await api.post('/token/', loginData);
        
        // Save token and user data
        console.log('Login success:', response.data);
        await AsyncStorage.setItem('userToken', response.data.token);
        
        // Create initial user data object WITHOUT role (will be determined later)
        const userData = {
          user_id: response.data.user_id,
          email: response.data.email,
          persona_id: response.data.persona_id,
          // Role will be set after verification
        };
        
        // ENHANCED ROLE DETECTION PROCEDURE
        console.log('🔍 INITIATING ROLE DETECTION PROCEDURE');
        if (response.data.persona_id) {
          try {
            console.log(`🔍 Step 1: Getting roles for persona_id: ${response.data.persona_id}`);
            const rolesResponse = await getUserRoles(response.data.persona_id);
            console.log(`🔍 Step 2: API returned ${rolesResponse?.length || 0} roles`);
            
            if (rolesResponse && Array.isArray(rolesResponse) && rolesResponse.length > 0) {
              console.log('🔍 Step 3: Analyzing received roles:');
              
              // Log each role for debugging
              rolesResponse.forEach((role, index) => {
                if (role && role.rol) {
                  console.log(`🔍 Role #${index+1}: ID=${role.rol.id}, Name=${role.rol.nombre || 'undefined'}`);
                } else {
                  console.log(`🔍 Role #${index+1} has invalid structure:`, role);
                }
              });
              
              // Check if user has both roles and get saved preference
              const hasCuidadorRole = rolesResponse.some(role => role?.rol?.id === 2);
              const hasPacienteRole = rolesResponse.some(role => role?.rol?.id === 1);
              
              if (hasCuidadorRole && hasPacienteRole) {
                console.log('🔍 User has both paciente and cuidador roles');
                
                // Check if user has a role priority preference saved
                const savedPriority = await AsyncStorage.getItem('rolePriority');
                if (savedPriority) {
                  console.log(`🔍 Found saved role priority: ${savedPriority}`);
                  
                  // Override default behavior with user preference
                  userData.role = savedPriority;
                  console.log(`🔍 Using saved priority: ${savedPriority}`);
                } else {
                  // Use default determination
                  userData.role = determinePrimaryRole(rolesResponse);
                  console.log(`🔍 Using default priority: ${userData.role}`);
                }
              } else {
                // Only one role, use standard determination
                userData.role = determinePrimaryRole(rolesResponse);
              }
              
              console.log(`🔍 Step 4: Final role determined: "${userData.role}"`);
            } else {
              console.log('🔍 Step 3: No valid roles found, defaulting to "paciente"');
              userData.role = 'paciente';
            }
          } catch (roleError) {
            console.error('Error getting roles:', roleError);
            console.error('Error stack trace:', roleError.stack);
            userData.role = 'paciente';  // Default role on error
          }
        }
        
        // Save the role in AsyncStorage and confirm what was saved
        console.log(`🔍 Step 6: FINAL ROLE BEING SAVED: "${userData.role}" for user ${userData.user_id}`);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // Double-check what was saved
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          const parsedData = JSON.parse(savedUserData);
          console.log('🔍 VERIFICATION - userData saved in AsyncStorage:', parsedData);
          console.log(`🔍 VERIFICATION - Saved role: "${parsedData.role}"`);
        }
        
        // Navigate to Home
        navigation.navigate('Home');
      } else {
        // Lógica de registro modificada para incluir el rol
        const registerData = {
          ...formData,
          rut: parseInt(formData.rut)
        };
        
        // Agregar la fecha solo si se ha seleccionado
        if (formData.fecha_nacimiento) {
          registerData.fecha_nacimiento = formatDateToDDMMYYYY(formData.fecha_nacimiento);
        }
        
        // Convertir la edad a número solo si está presente
        if (formData.edad) {
          registerData.edad = parseInt(formData.edad);
        }
        
        const response = await api.post('/register/', registerData);
        
        console.log('Registration success:', response.data);
        
        // Ahora vinculamos el rol seleccionado
        if (response.data.persona_id) {
          try {
            // Primero obtenemos el ID del rol (paciente o cuidador)
            const rolResponse = await api.get('/roles/');
            const roles = rolResponse.data;
            
            const rolSeleccionado = roles.find(r => r.nombre.toLowerCase() === selectedRole.toLowerCase());
            
            if (rolSeleccionado) {
              // Creamos la vinculación entre usuario y rol
              await api.post('/usuario-roles/', {
                id_persona: response.data.persona_id,
                rol: rolSeleccionado.id
              });
              
              console.log(`Usuario vinculado como ${selectedRole}`);
            } else {
              console.error('No se encontró el rol seleccionado');
            }
          } catch (rolError) {
            console.error('Error al vincular el rol:', rolError);
          }
        }
        
        // Mostrar alerta de éxito y luego iniciar sesión automáticamente
        Alert.alert(
          'Registro Exitoso', 
          '¡Su cuenta ha sido creada correctamente!',
          [{ 
            text: 'Continuar', 
            onPress: async () => {
              try {
                // Iniciar sesión automáticamente usando el RUT y contraseña proporcionados
                const loginResponse = await api.post('/token/', {
                  rut: registerData.rut,
                  password: registerData.password
                });
                
                // Guardar token y datos del usuario
                await AsyncStorage.setItem('userToken', loginResponse.data.token);
                
                // Guardar datos adicionales del usuario
                const userData = {
                  user_id: loginResponse.data.user_id,
                  email: loginResponse.data.email,
                  persona_id: loginResponse.data.persona_id
                };
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                
                // Redireccionar al Home
                navigation.navigate('Home');
              } catch (loginError) {
                console.error('Error en inicio de sesión automático:', loginError);
                // Si falla el inicio de sesión automático, regresar a la pantalla de login
                setIsLogin(true);
              }
            }
          }]
        );
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Ha ocurrido un error. Por favor intente nuevamente.';
      
      if (error.response) {
        console.log('Error data:', error.response.data);
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 400) {
          errorMessage = 'Datos de registro inválidos. Por favor verifique la información ingresada.';
        } else if (error.response.status === 409) {
          errorMessage = 'Este usuario ya existe. Por favor intente con otro email o RUT.';
        }
      }
      
      Alert.alert(isLogin ? 'Error de inicio de sesión' : 'Error de registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Método para alternar entre login por email o RUT
  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === 'email' ? 'rut' : 'email');
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
              
              {/* Selector de método de login (solo visible en modo login) */}
              {isLogin && (
                <View style={styles.loginMethodContainer}>
                  <TouchableOpacity 
                    style={[styles.methodButton, loginMethod === 'rut' && styles.methodButtonActive]}
                    onPress={() => setLoginMethod('rut')}
                  >
                    <MaterialIcons name="credit-card" size={20} color={loginMethod === 'rut' ? '#F1E3D3' : '#690B22'} />
                    <Text style={[styles.methodText, loginMethod === 'rut' && styles.methodTextActive]}>RUT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.methodButton, loginMethod === 'email' && styles.methodButtonActive]}
                    onPress={() => setLoginMethod('email')}
                  >
                    <MaterialIcons name="email" size={20} color={loginMethod === 'email' ? '#F1E3D3' : '#690B22'} />
                    <Text style={[styles.methodText, loginMethod === 'email' && styles.methodTextActive]}>Email</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Campos de entrada según modo de login/registro */}
              {(isLogin && loginMethod === 'email') ? (
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
              ) : isLogin && loginMethod === 'rut' ? (
                <View style={styles.inputContainer}>
                  <MaterialIcons name="credit-card" size={24} color="#690B22" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="RUT (sin puntos ni guión)"
                    placeholderTextColor="#666"
                    value={formData.rut}
                    onChangeText={(text) => setFormData({...formData, rut: text})}
                    keyboardType="numeric"
                    autoFocus={true} // Enfocamos automáticamente el campo RUT
                  />
                </View>
              ) : (
                // Campos de registro
                <>
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
                </>
              )}

              {/* El resto de campos (contraseña, etc.) */}
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

              {/* Campos específicos de registro */}
              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="credit-card" size={24} color="#690B22" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="RUT (sin puntos ni guión)"
                      placeholderTextColor="#666"
                      value={formData.rut}
                      onChangeText={(text) => setFormData({...formData, rut: text})}
                      keyboardType="numeric"
                    />
                  </View>

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
                  
                  {/* Selector de fecha mejorado */}
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="event" size={24} color="#690B22" style={styles.icon} />
                    <CrossPlatformDatePicker
                      value={formData.fecha_nacimiento}
                      onChange={(selectedDate) => {
                        setFormData({...formData, fecha_nacimiento: selectedDate});
                        
                        // Calcular edad automáticamente
                        if (selectedDate) {
                          const today = new Date();
                          let age = today.getFullYear() - selectedDate.getFullYear();
                          const monthDiff = today.getMonth() - selectedDate.getMonth();
                          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
                            age--;
                          }
                          setFormData(prev => ({...prev, edad: age.toString()}));
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  </View>

                  {/* Selector de género con botones en lugar de TextInput */}
                  <View style={styles.genderContainer}>
                    <Text style={styles.genderTitle}>Género:</Text>
                    <View style={styles.genderOptions}>
                      <TouchableOpacity
                        style={[
                          styles.genderOption,
                          selectedGender === 'Masculino' && styles.genderOptionSelected
                        ]}
                        onPress={() => setSelectedGender('Masculino')}
                      >
                        <MaterialIcons 
                          name="male" 
                          size={24} 
                          color={selectedGender === 'Masculino' ? "white" : "#690B22"} 
                        />
                        <Text style={[
                          styles.genderText,
                          selectedGender === 'Masculino' && styles.genderTextSelected
                        ]}>
                          Masculino
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.genderOption,
                          selectedGender === 'Femenino' && styles.genderOptionSelected
                        ]}
                        onPress={() => setSelectedGender('Femenino')}
                      >
                        <MaterialIcons 
                          name="female" 
                          size={24} 
                          color={selectedGender === 'Femenino' ? "white" : "#690B22"} 
                        />
                        <Text style={[
                          styles.genderText,
                          selectedGender === 'Femenino' && styles.genderTextSelected
                        ]}>
                          Femenino
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialIcons name="wc" size={24} color="#690B22" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Género (opcional)"
                      placeholderTextColor="#666"
                      value={formData.genero}
                      onChangeText={(text) => setFormData({...formData, genero: text})}
                    />
                  </View>
                  
                  {/* Selector de rol (paciente o cuidador) */}
                  <View style={styles.roleContainer}>
                    <Text style={styles.roleTitle}>Seleccione su rol:</Text>
                    <View style={styles.roleOptions}>
                      <TouchableOpacity
                        style={[
                          styles.roleOption,
                          selectedRole === 'paciente' && styles.roleOptionSelected
                        ]}
                        onPress={() => setSelectedRole('paciente')}
                      >
                        <MaterialIcons 
                          name="person" 
                          size={24} 
                          color={selectedRole === 'paciente' ? "white" : "#690B22"} 
                        />
                        <Text style={[
                          styles.roleText,
                          selectedRole === 'paciente' && styles.roleTextSelected
                        ]}>
                          Paciente
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.roleOption,
                          selectedRole === 'cuidador' && styles.roleOptionSelected
                        ]}
                        onPress={() => setSelectedRole('cuidador')}
                      >
                        <MaterialIcons 
                          name="medical-services" 
                          size={24} 
                          color={selectedRole === 'cuidador' ? "white" : "#690B22"} 
                        />
                        <Text style={[
                          styles.roleText,
                          selectedRole === 'cuidador' && styles.roleTextSelected
                        ]}>
                          Cuidador
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#F1E3D3" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                  </Text>
                )}
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
  dateText: {
    flex: 1,
    paddingVertical: 12,
    color: '#1B4D3E',
  },
  
  loginButtonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  loginMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E3D3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  methodButtonActive: {
    backgroundColor: '#690B22',
  },
  methodText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#690B22',
    fontWeight: '500',
  },
  methodTextActive: {
    color: '#F1E3D3',
  },
  // Estilos para el selector de fecha
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dateButtonText: {
    color: '#1B4D3E',
    fontSize: 16,
  },
  
  // Estilos para el selector de rol
  roleContainer: {
    marginVertical: 15,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 10,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E3D3',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  roleOptionSelected: {
    backgroundColor: '#690B22',
  },
  roleText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#690B22',
    fontWeight: '500',
  },
  roleTextSelected: {
    color: 'white',
  },
  
  // Estilos para el selector de género - similar al selector de rol
  genderContainer: {
    marginVertical: 15,
  },
  genderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 10,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E3D3',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  genderOptionSelected: {
    backgroundColor: '#690B22',
  },
  genderText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#690B22',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: 'white',
  },
});