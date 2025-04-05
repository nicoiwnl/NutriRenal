import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/scannerStyles';

const ScanResultView = ({ results, imageUri, onScanAgain }) => {
  if (!results || !results.alimento) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>No se encontraron resultados</Text>
        <TouchableOpacity
          style={styles.resultFooterButton}
          onPress={onScanAgain}
        >
          <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
          <Text style={styles.resultFooterButtonText}>Escanear Otro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { alimento } = results;

  return (
    <ScrollView style={styles.resultContainer}>
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>{alimento.nombre}</Text>
        <Text style={styles.resultContent}>
          <Text style={{ fontWeight: 'bold' }}>Clasificación: </Text>
          {alimento.clasificacion}
        </Text>
        <Text style={styles.resultContent}>
          <Text style={{ fontWeight: 'bold' }}>Calorías: </Text>
          {alimento.calorias} kcal por 100g
        </Text>
        
        {imageUri && (
          <View style={styles.resultImageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.resultImage}
              resizeMode="cover"
            />
          </View>
        )}
        
        <Text style={[styles.resultTitle, { marginTop: 16 }]}>Propiedades</Text>
        {alimento.propiedades.map((propiedad, index) => (
          <Text key={index} style={styles.resultContent}>• {propiedad}</Text>
        ))}
        
        <Text style={[styles.resultTitle, { marginTop: 16 }]}>Recomendación</Text>
        <Text style={styles.resultContent}>{alimento.recomendacion}</Text>
        
        <View style={styles.resultFooter}>
          <TouchableOpacity
            style={styles.resultFooterButton}
            onPress={onScanAgain}
          >
            <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
            <Text style={styles.resultFooterButtonText}>Escanear Otro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ScanResultView;
