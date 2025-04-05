import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Componentes y hooks del módulo de autenticación
import WelcomeHeader from '../modules/auth/components/WelcomeHeader';
import QuickAccessButton from '../modules/auth/components/QuickAccessButton';
import LogoutButton from '../modules/auth/components/LogoutButton';
import useHome from '../modules/auth/hooks/useHome';
import styles from '../modules/auth/styles/homeStyles';

export default function HomeScreen({ navigation }) {
  // Obtener estado y funciones del hook personalizado
  const {
    loading,
    personaId,
    userRole,
    userName,
    showDebugUI,
    handleLogout,
    navigateToDashboard,
    forceRole,
    resetRole
  } = useHome(navigation);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F1E3D3', '#F8E8D8']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          {/* Encabezado de bienvenida */}
          <WelcomeHeader userName={userName} userRole={userRole} />
          
          {/* Dashboard principal */}
          <View style={styles.dashboardCard}>
            <View style={styles.dashboardCardContent}>
              <View>
                <Text style={styles.dashboardTitle}>Mi Ficha Médica</Text>
                <Text style={styles.dashboardSubtitle}>
                  Acceda a su información médica
                </Text>
              </View>
              <QuickAccessButton 
                icon="medical-services" 
                title=""
                onPress={navigateToDashboard}
              />
            </View>
          </View>
          
          {/* Accesos rápidos */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
            
            <View style={styles.actionGrid}>
              <QuickAccessButton
                icon="restaurant"
                title="Alimentos"
                onPress={() => navigation.navigate('Alimentos')}
              />
              <QuickAccessButton
                icon="lightbulb"
                title="Consejos"
                onPress={() => navigation.navigate('Consejos')}
              />
              <QuickAccessButton
                icon="people"
                title="Comunidad"
                onPress={() => navigation.navigate('Comunidad')}
              />
              <QuickAccessButton
                icon="menu-book"
                title="Recetas"
                onPress={() => navigation.navigate('Recetas')}
              />
            </View>
          </View>
          
          {/* Debug UI para desarrollo - Selector de Rol */}
          {showDebugUI && (
            <View style={{ padding: 10, margin: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
              <Text style={styles.debugWarning}>DEVELOPER MODE: ROLE SELECTOR</Text>
              <View style={styles.debugRoleButtons}>
                <TouchableOpacity 
                  style={[styles.debugRoleButton, userRole === 'paciente' && styles.activeRoleButton]} 
                  onPress={() => forceRole('paciente')}
                >
                  <Text style={styles.debugRoleText}>Paciente</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.debugRoleButton, userRole === 'cuidador' && styles.activeRoleButton]} 
                  onPress={() => forceRole('cuidador')}
                >
                  <Text style={styles.debugRoleText}>Cuidador</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.resetRoleButton} onPress={resetRole}>
                <Text style={styles.resetRoleText}>RESET ROLE TO DEFAULT</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Botón de cerrar sesión */}
          <LogoutButton onPress={handleLogout} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}