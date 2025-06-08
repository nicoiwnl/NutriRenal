import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialIcons } from '@expo/vector-icons';
import { Toaster } from 'sonner-native';
import { useNavigation } from '@react-navigation/native';
import { MenuProvider } from 'react-native-popup-menu';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import FichaMedicaScreen from "../screens/FichaMedicaScreen";
import ComunidadScreen from "../screens/ComunidadScreen";
import QRScannerScreen from "../screens/QRScannerScreen";
import AlimentosScreen from "../screens/AlimentosScreen";
import AlimentoDetailScreen from "../screens/AlimentoDetailScreen";
import ConsejosScreen from "../screens/ConsejosScreen";
import AlimentosCategoriaScreen from "../screens/AlimentosCategoriaScreen";
import ConsejosCategoriaScreen from "../screens/ConsejosCategoriaScreen";
import ConsejosPorCategoriaScreen from "../screens/ConsejosPorCategoriaScreen";
import NuevaPublicacionScreen from '../screens/NuevaPublicacionScreen';
import PublicacionDetailScreen from '../screens/PublicacionDetailScreen';
import MisPublicacionesScreen from '../screens/MisPublicacionesScreen';
import ForosScreen from '../screens/ForosScreen'; // Add the import for ForosScreen

import MinutaScreen from '../screens/MinutaScreen';
import RecetasScreen from '../screens/RecetasScreen';
import CentrosMedicosScreen from '../screens/CentrosMedicosScreen';
import MisRegistrosScreen from '../screens/MisRegistrosScreen';
import RecetaDetailScreen from '../screens/RecetaDetailScreen';
import IngredientesAlimentosScreen from '../screens/IngredientesAlimentosScreen';
import ScanResultScreen from '../screens/ScanResultScreen'; // Añade esta importación

// New: Define the navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Añadir función para limpiar datos al cerrar sesión
function clearUserData() {
  return Promise.all([
    AsyncStorage.removeItem('userToken'),
    AsyncStorage.removeItem('userData')
  ]);
}

function HeaderRight({ navigation }) {
  const handleLogout = async () => {
    await clearUserData(); // Usar función centralizada para limpiar datos
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // Función auxiliar para navegar al tab correcto
  const navigateToTab = (tabName) => {
    navigation.navigate('Home', { screen: tabName });
  };

  return (
    <Menu>
      <MenuTrigger customStyles={{
        triggerWrapper: {
          padding: 5,
        }
      }}>
        <MaterialIcons name="more-vert" size={28} color="#690B22" />
      </MenuTrigger>
      <MenuOptions customStyles={{
        optionsContainer: {
          borderRadius: 8,
          padding: 5,
          width: 220,
          backgroundColor: 'white',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            },
            android: {
              elevation: 5,
            },
            web: {
              boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
            },
          }),
        },
        optionWrapper: {
          padding: 0,
        },
      }}>
        <MenuOption onSelect={() => navigateToTab('FichaMedica')}>
          <View style={styles.menuItem}>
            <MaterialIcons name="description" size={20} color="#690B22" />
            <Text style={styles.menuText}>Ficha Médica</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={() => navigateToTab('Alimentos')}>
          <View style={styles.menuItem}>
            <MaterialIcons name="restaurant" size={20} color="#690B22" />
            <Text style={styles.menuText}>Alimentos</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={() => navigation.navigate('Minuta')}>
          <View style={styles.menuItem}>
            <MaterialIcons name="event-note" size={20} color="#690B22" />
            <Text style={styles.menuText}>Minuta</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={() => navigation.navigate('Recetas')}>
          <View style={styles.menuItem}>
            <MaterialIcons name="menu-book" size={20} color="#690B22" />
            <Text style={styles.menuText}>Recetas</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={() => navigation.navigate('CentrosMedicos')}>
          <View style={styles.menuItem}>
            <MaterialIcons name="local-hospital" size={20} color="#690B22" />
            <Text style={styles.menuText}>Centros Médicos</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={() => navigation.navigate('MisRegistros')}>
          <View style={styles.menuItem}>
            <MaterialIcons name="history" size={20} color="#690B22" />
            <Text style={styles.menuText}>Mis Registros</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={() => navigation.navigate('IngredientesAlimentos')}>
          <View style={styles.menuItem}>
            <MaterialIcons name="food-bank" size={20} color="#690B22" />
            <Text style={styles.menuText}>Qué como</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={() => navigateToTab('Consejos')}>
          <View style={styles.menuItem}>
            <MaterialIcons name="lightbulb" size={20} color="#690B22" />
            <Text style={styles.menuText}>Consejos</Text>
          </View>
        </MenuOption>
        <View style={styles.menuDivider} />
        <MenuOption onSelect={handleLogout}>
          <View style={styles.menuItem}>
            <MaterialIcons name="logout" size={20} color="#F44336" />
            <Text style={[styles.menuText, { color: '#F44336' }]}>Cerrar Sesión</Text>
          </View>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
}

function TabNavigator({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'FichaMedica') {
            iconName = 'medical-services';
          } else if (route.name === 'Comunidad') {
            iconName = 'people';
          } else if (route.name === 'QRScanner') {
            iconName = 'camera-alt';
          } else if (route.name === 'Alimentos') {
            iconName = 'restaurant';
          } else if (route.name === 'Consejos') {
            iconName = 'lightbulb';
          }

          return <MaterialIcons name={iconName} size={route.name === 'QRScanner' ? 32 : size} color={color} />;
        },
        tabBarActiveTintColor: '#690B22',
        tabBarInactiveTintColor: '#1B4D3E',
        headerShown: true,
        headerTitle: route.name,
        headerTitleAlign: 'center',
        headerRight: () => <HeaderRight navigation={navigation} />,
        tabBarStyle: ({ focused }) => ({
          backgroundColor: '#F1E3D3',
          borderTopWidth: 0,
          elevation: 0,
          boxShadow: Platform.OS === 'web' ? '0px 4px 5px rgba(0, 0, 0, 0.1)' : undefined,
          elevation: 5,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 10,
          left: 20,
          right: 20,
          borderRadius: 20,
        }),
        tabBarItemStyle: {
          marginTop: route.name === 'QRScanner' ? -20 : 0,
        }
      })}
    >
      <Tab.Screen 
        name="FichaMedica" //cambiar despues
        component={FichaMedicaScreen}
        options={{ title: 'Ficha Médica' }}
      />
      <Tab.Screen 
        name="Comunidad" 
        component={ComunidadScreen}
        options={{ title: 'Comunidad' }}
      />
      <Tab.Screen 
        name="QRScanner" // cambiar despues
        component={QRScannerScreen}
        options={{ title: 'Análisis IA' }}
      />
      <Tab.Screen 
        name="Alimentos" 
        component={AlimentosScreen}
        options={{ title: 'Alimentos' }}
      />
      <Tab.Screen 
        name="Consejos" 
        component={ConsejosScreen}
        options={{ title: 'Consejos' }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator 
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: 'center',
        headerRight: () => <HeaderRight navigation={navigation} />,
      })}
      initialRouteName="Login"
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: '', headerShown: false }}
      />
      <Stack.Screen 
        name="Home" 
        component={TabNavigator} 
        options={{ title: 'Inicio', headerShown: false }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ title: 'Recuperar Contraseña',headerShown: false }}
      />
      
      {/* Add these screens to the root stack */}
      <Stack.Screen 
        name="NuevaPublicacion" 
        component={NuevaPublicacionScreen} 
        options={{ 
          title: 'Nueva Publicación',
          // Add this to improve navigation behavior
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="PublicacionDetail" 
        component={PublicacionDetailScreen} 
        options={{ title: 'Publicación' }}
      />
      
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
        name="MisPublicaciones" 
        component={MisPublicacionesScreen} 
        options={{ 
          title: 'Mis Publicaciones',
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="ScanResult" 
        component={ScanResultScreen} 
        options={{ 
          title: 'Análisis de Alimento',
          presentation: 'card',
          animation: 'slide_from_bottom'
        }}
      />
      {/* Nuevas pantallas */}
      <Stack.Screen 
        name="Minuta" 
        component={MinutaScreen} 
        options={{ title: 'Mi Minuta Nutricional' }}
      />
      <Stack.Screen 
        name="Recetas" 
        component={RecetasScreen} 
        options={{ title: 'Recetas Recomendadas' }}
      />
      <Stack.Screen 
        name="RecetaDetail" 
        component={RecetaDetailScreen} 
        options={{ title: 'Detalle de Receta' }}
      />
      <Stack.Screen 
        name="CentrosMedicos" 
        component={CentrosMedicosScreen} 
        options={{ title: 'Centros Médicos' }}
      />
      <Stack.Screen 
        name="MisRegistros" 
        component={MisRegistrosScreen} 
        options={{ title: 'Mis Registros Alimenticios' }}
      />
      <Stack.Screen
        name="IngredientesAlimentos"
        component={IngredientesAlimentosScreen}
        options={{ title: 'Qué como' }}
      />
      <Stack.Screen 
        name="Foro" 
        component={ForosScreen} 
        options={{ title: 'Foros de la Comunidad' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <MenuProvider>
      <SafeAreaProvider style={styles.container}>
        <Toaster />
        <RootStack />
      </SafeAreaProvider>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  
  menuText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 15,
  },
  
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
    marginHorizontal: 10,
  },
});