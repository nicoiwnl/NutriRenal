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

// New: Define the navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HeaderRight() {
  return (
    <Menu>
      <MenuTrigger>
        <MaterialIcons name="more-vert" size={28} color="#690B22" />
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={() => alert('Opción 1')}>
          <Text style={{ padding: 10 }}>Opción 1</Text>
        </MenuOption>
        <MenuOption onSelect={() => alert('Opción 2')}>
          <Text style={{ padding: 10 }}>Opción 2</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
}

function TabNavigator() {
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
        headerRight: () => <HeaderRight />,
        tabBarStyle: ({ focused }) => ({
          backgroundColor: '#F1E3D3',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 10,
          left: 20,
          right: 20,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
        }),
        tabBarItemStyle: {
          marginTop: route.name === 'QRScanner' ? -20 : 0,
        }
      })}
    >
      <Tab.Screen 
        name="FichaMedica" 
        component={FichaMedicaScreen}
        options={{ title: 'Ficha Médica' }}
      />
      <Tab.Screen 
        name="Comunidad" 
        component={ComunidadScreen}
        options={{ title: 'Comunidad' }}
      />
      <Tab.Screen 
        name="QRScanner" 
        component={QRScannerScreen}
        options={{ title: 'Escanear' }}
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
  const navigation = useNavigation();
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerRight: () => <HeaderRight />,
      }}
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
  }
});