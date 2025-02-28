import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import AlimentosScreen from './screens/AlimentosScreen';
import AlimentoDetailScreen from './screens/AlimentoDetailScreen';
import AlimentosCategoriaScreen from './screens/AlimentosCategoriaScreen';
import ConsejosCategoriaScreen from './screens/ConsejosCategoriaScreen';
import ConsejosPorCategoriaScreen from './screens/ConsejosPorCategoriaScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Alimentos" component={AlimentosScreen} />
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
    </NavigationContainer>
  );
}
