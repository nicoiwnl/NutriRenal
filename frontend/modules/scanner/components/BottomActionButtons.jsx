import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const BottomActionButtons = ({ 
  onScanAgain, 
  onGoHome, 
  onBack, 
  variant = 'default',
  backButtonLabel = "Volver",
  scanAgainButtonLabel = "Escanear Otro",
  homeButtonLabel = "Ir al inicio"
}) => {
  // Configuración según la variante
  if (variant === 'readOnly') {
    return (
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.backButton]}
          onPress={onBack}
        >
          <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>{backButtonLabel}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.scanAgainButton]}
          onPress={onScanAgain}
        >
          <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>{scanAgainButtonLabel}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Variante por defecto
  return (
    <View style={styles.bottomButtonsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.scanAgainButton]}
        onPress={onScanAgain}
      >
        <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>{scanAgainButtonLabel}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.actionButton, styles.goHomeButton]}
        onPress={onGoHome}
      >
        <MaterialIcons name="home" size={20} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>{homeButtonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#F8E8D8',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 150,
  },
  scanAgainButton: {
    backgroundColor: '#690B22',
  },
  backButton: {
    backgroundColor: '#1B4D3E',
  },
  goHomeButton: {
    backgroundColor: '#1B4D3E',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default BottomActionButtons;
