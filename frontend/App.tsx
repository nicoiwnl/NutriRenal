import React, { useEffect, useState } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Text } from 'react-native';

// Screens
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import AlimentosScreen from './screens/AlimentosScreen';
import AlimentoDetailScreen from './screens/AlimentoDetailScreen';
import AlimentosCategoriaScreen from './screens/AlimentosCategoriaScreen';
import ConsejosCategoriaScreen from './screens/ConsejosCategoriaScreen';
import ConsejosPorCategoriaScreen from './screens/ConsejosPorCategoriaScreen';
import FichaMedicaScreen from './screens/FichaMedicaScreen';
import ComunidadScreen from './screens/ComunidadScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import ConsejosScreen from './screens/ConsejosScreen';
import RoleDiagnosticScreen from './screens/RoleDiagnosticScreen';
import PublicacionDetailScreen from './screens/PublicacionDetailScreen';
import NuevaPublicacionScreen from './screens/NuevaPublicacionScreen';

// Log the imported component to verify it's loaded correctly
console.log('NuevaPublicacionScreen imported:', NuevaPublicacionScreen);

// Create a simple CheckAuthScreen component to avoid undefined errors
const CheckAuthScreen = ({ navigation }) => {
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      navigation.navigate(token ? 'Home' : 'Login');
    };
    
    checkToken();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#690B22" />
    </View>
  );
};

const Stack = createNativeStackNavigator();

// Set up navigation service
import NavigationService from './navigation/NavigationService';

export default function App() {
  const navigationRef = React.useRef(null);
  
  // Configure the navigation reference for use with NavigationService
  useEffect(() => {
    if (navigationRef.current) {
      NavigationService.setTopLevelNavigator(navigationRef.current);
    }
  }, [navigationRef.current]);

  // Custom handler for unhandled navigation actions
  const handleUnhandledAction = (action) => {
    // Log the action without showing warning
    console.log('Action not handled by navigator:', action.type, action.payload);
    
    // Try fallback navigation using CommonActions if possible
    if (navigationRef.current && action.type === 'NAVIGATE') {
      const { name, params } = action.payload;
      console.log(`Attempting fallback navigation to ${name}`);
      
      try {
        // Try using the common dispatch method
        navigationRef.current.dispatch(
          CommonActions.navigate({
            name: name,
            params: params
          })
        );
      } catch (err) {
        console.log('Fallback navigation failed:', err);
      }
    }
    
    // Return false to suppress the default warning
    return false;
  };

  return (
    <MenuProvider>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            console.log('NavigationContainer is ready');
            NavigationService.setTopLevelNavigator(navigationRef.current);
          }}
          onUnhandledAction={handleUnhandledAction}
        >
          <Stack.Navigator 
            initialRouteName="CheckAuth"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#F1E3D3',
              },
              headerTintColor: '#690B22',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerRight: () => (
                <MaterialIcons name="menu" size={24} color="#690B22" />
              ),
            }}
          >
            {/* Authentication screens */}
            <Stack.Screen 
              name="CheckAuth" 
              component={CheckAuthScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen} 
              options={{ title: 'Recuperar Contraseña' }} 
            />

            {/* Main screens - ENSURE CONSISTENT NAMING */}
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="NuevaPublicacion" 
              component={NuevaPublicacionScreen} 
              options={{ title: 'Nueva Publicación' }} 
            />
            <Stack.Screen 
              name="Comunidad" 
              component={ComunidadScreen} 
            />
            <Stack.Screen 
              name="PublicacionDetail" 
              component={PublicacionDetailScreen} 
              options={{ title: 'Publicación' }} 
            />
            <Stack.Screen 
              name="QRScanner" 
              component={QRScannerScreen} 
              options={{ title: 'Escanear QR' }} 
            />
            <Stack.Screen 
              name="Alimentos" 
              component={AlimentosScreen} 
              options={{ title: 'Alimentos' }} 
            />
            <Stack.Screen 
              name="Consejos" 
              component={ConsejosScreen} 
              options={{ title: 'Consejos' }} 
            />
            <Stack.Screen 
              name="FichaMedica" 
              component={FichaMedicaScreen} 
              options={{ title: 'Ficha Médica' }} 
            />

            {/* Secondary screens */}
            <Stack.Screen 
              name="AlimentoDetailScreen" 
              component={AlimentoDetailScreen} 
              options={{ title: 'Detalle del Alimento' }} 
            />
            <Stack.Screen 
              name="AlimentosCategoriaScreen" 
              component={AlimentosCategoriaScreen} 
              options={{ title: 'Categoría' }} 
            />
            <Stack.Screen 
              name="ConsejosCategoriaScreen" 
              component={ConsejosCategoriaScreen} 
              options={{ title: 'Categorías de Consejos' }} 
            />
            <Stack.Screen 
              name="ConsejosPorCategoriaScreen" 
              component={ConsejosPorCategoriaScreen} 
              options={({ route }) => ({ title: route.params.categoria })}
            />
            <Stack.Screen 
              name="RoleDiagnostic" 
              component={RoleDiagnosticScreen} 
              options={{ title: 'Diagnóstico de Roles' }} 
            />
            
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </MenuProvider>
  );
}
