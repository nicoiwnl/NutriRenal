import { CommonActions } from '@react-navigation/native';

// Variable global para almacenar la referencia del navegador
let _navigator = null;

/**
 * Función para establecer el navegador en el nivel superior
 * Asegurar que se almacene correctamente la referencia
 */
function setTopLevelNavigator(navigatorRef) {
  if (navigatorRef) {
    _navigator = navigatorRef;
    console.log('✓ NavigationService: Navigator set successfully', _navigator);
    return true;
  } else {
    console.warn('✗ NavigationService: Received null navigator reference');
    return false;
  }
}

/**
 * Función para verificar si el navegador está disponible
 */
function isNavigatorAvailable() {
  return _navigator !== null && _navigator !== undefined;
}

/**
 * Función para navegar a una ruta específica con mejor manejo de errores
 */
function navigate(routeName, params = {}) {
  if (!isNavigatorAvailable()) {
    console.error(`✗ NavigationService: Navigator is not available! Cannot navigate to: ${routeName}`);
    return false;
  }

  try {
    // Verificar si la ruta existe
    const state = _navigator.getRootState();
    const routeExists = state.routeNames.includes(routeName);
    
    if (!routeExists) {
      console.error(`✗ NavigationService: Route "${routeName}" does not exist. Available routes:`, state.routeNames);
      return false;
    }
    
    console.log(`→ NavigationService: Navigating to ${routeName}`, params);
    _navigator.dispatch(
      CommonActions.navigate({
        name: routeName,
        params,
      })
    );
    return true;
  } catch (error) {
    console.error(`✗ NavigationService: Error navigating to ${routeName}:`, error);
    return false;
  }
}

/**
 * Función para volver a la pantalla anterior
 */
function goBack() {
  if (isNavigatorAvailable()) {
    _navigator.dispatch(CommonActions.goBack());
    return true;
  }
  console.warn('✗ NavigationService: Navigator is not set! Cannot go back.');
  return false;
}

// Exportar las funciones de navegación
export default {
  navigate,
  setTopLevelNavigator,
  goBack,
  isNavigatorAvailable
};
