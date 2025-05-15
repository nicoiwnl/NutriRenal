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
import ForosScreen from './screens/ForosScreen';  // Garantizar que este nombre coincide con el archivo real
import MisPublicacionesScreen from './screens/MisPublicacionesScreen';

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

export default function App() {
  const navigationRef = React.useRef(null);
  
  // Simplificar la configuración - solo logging para depuración
  const onNavigationReady = () => {
    console.log('🔄 NavigationContainer is ready');
    
    if (navigationRef.current) {
      const state = navigationRef.current.getRootState();
      console.log("📋 Available routes:", state.routeNames);
      
      // Verificar específicamente la ruta 'Foros'
      const forosExists = state.routeNames.includes('Foros');
      console.log(`🔍 'Foros' route exists: ${forosExists ? 'YES ✓' : 'NO ✗'}`);
    }
  };

  return (
    <MenuProvider>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={onNavigationReady}
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
            <Stack.Screen 
              name="Foro" 
              component={ForosScreen}  // Usar el nombre exacto del componente importado
              options={{ title: 'Foros de la Comunidad' }} 
            />
            
            <Stack.Screen 
              name="MisPublicaciones" 
              component={MisPublicacionesScreen} 
              options={{ 
                title: 'Mis Publicaciones',
                presentation: 'card',
                animation: 'slide_from_right'
              }}
            />

          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </MenuProvider>
  );
}
