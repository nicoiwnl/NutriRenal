import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/homeStyles';

const WelcomeHeader = ({ userName, userRole }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.welcomeText}>
          Bienvenido{userName ? `, ${userName}` : ''}
        </Text>
        <Text style={styles.appName}>NutriRenal</Text>
        {userRole && (
          <View style={styles.roleBadge}>
            <MaterialIcons 
              name={userRole === 'cuidador' ? 'medical-services' : 'person'} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.roleText}>
              {userRole === 'cuidador' ? 'Cuidador' : 'Paciente'}
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.profileButton}>
        <MaterialIcons name="account-circle" size={32} color="#690B22" />
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeHeader;
