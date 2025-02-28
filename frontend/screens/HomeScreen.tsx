import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function HomeScreen() {  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#F1E3D3', '#fff']}
        style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Bienvenido a</Text>
            <Text style={styles.appName}>NutriRenal</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialIcons name="account-circle" size={40} color="#690B22" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="trending-up" size={24} color="#E07A5F" />
              <Text style={styles.statValue}>80%</Text>
              <Text style={styles.statLabel}>Progreso</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="today" size={24} color="#E07A5F" />
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Días seguidos</Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionCard}>
                <MaterialIcons name="assignment" size={32} color="#E07A5F" />
                <Text style={styles.actionText}>Mis Registros</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <MaterialIcons name="restaurant-menu" size={32} color="#E07A5F" />
                <Text style={styles.actionText}>Plan Nutricional</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <MaterialIcons name="insert-chart" size={32} color="#E07A5F" />
                <Text style={styles.actionText}>Progreso</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <MaterialIcons name="notifications" size={32} color="#E07A5F" />
                <Text style={styles.actionText}>Recordatorios</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.recentActivity}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <View style={styles.activityCard}>
              <MaterialIcons name="water-drop" size={24} color="#690B22" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Registro de Agua</Text>
                <Text style={styles.activityTime}>Hace 2 horas</Text>
              </View>
            </View>
            <View style={styles.activityCard}>
              <MaterialIcons name="restaurant" size={24} color="#690B22" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Almuerzo Registrado</Text>
                <Text style={styles.activityTime}>Hace 4 horas</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#1B4D3E',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
  },
  profileButton: {
    padding: 5,
  },  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    width: isWeb ? Math.min(800, width) : undefined,
    alignSelf: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
    marginVertical: 5,
  },
  statLabel: {
    color: '#1B4D3E',
    fontSize: 14,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: isWeb ? Math.min(800, width) : undefined,
    alignSelf: 'center',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    color: '#1B4D3E',
    fontSize: 14,
    textAlign: 'center',
  },
  recentActivity: {
    padding: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  activityInfo: {
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 16,
    color: '#1B4D3E',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});