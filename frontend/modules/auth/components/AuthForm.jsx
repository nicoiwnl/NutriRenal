import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/loginStyles';
import CrossPlatformDatePicker from './CrossPlatformDatePicker';
import GenderSelector from './GenderSelector';
import RoleSelector from './RoleSelector';
import LoginMethodSelector from './LoginMethodSelector';

const AuthForm = ({ 
  isLogin, 
  loginMethod, 
  setLoginMethod, 
  formData, 
  setFormData, 
  selectedGender, 
  setSelectedGender, 
  selectedRole, 
  setSelectedRole, 
  handleDateChange, 
  handleSubmit, 
  loading,
  formatDateToDDMMYYYY,
  navigation 
}) => {
  return (
    <View>
      {/* Selector de método de login (solo visible en modo login) */}
      {isLogin && (
        <LoginMethodSelector 
          loginMethod={loginMethod} 
          setLoginMethod={setLoginMethod} 
        />
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
            autoFocus={true}
          />
        </View>
      ) : (
        // Campos de registro
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
      )}

      {/* Campo de contraseña para ambos modos */}
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
              onChange={handleDateChange}
              maximumDate={new Date()}
              formatDateToDDMMYYYY={formatDateToDDMMYYYY}
            />
          </View>

          {/* Selector de género - Eliminado campo redundante */}
          <GenderSelector
            selectedGender={selectedGender}
            setSelectedGender={setSelectedGender}
          />
          
          {/* Selector de rol */}
          <RoleSelector
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        </>
      )}

      {/* Botón de acción (login o registro) */}
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

      {/* Enlace a recuperación de contraseña (solo en modo login) */}
      {isLogin && (
        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AuthForm;
