import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ImagePreviewScreen({ route, navigation }) {
  const { imageUri } = route.params || {};
  
  return (
    <SafeAreaView style={styles.container}>
      {imageUri ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#690B22" />
            </TouchableOpacity>
            <Text style={styles.title}>Imagen escaneada</Text>
            <View style={{width: 24}} />
          </View>
          
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="contain"
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.analyzeButton}
              onPress={() => {
                // Aquí podrías añadir la lógica para analizar la imagen
                alert('Análisis de imagen no implementado');
              }}
            >
              <MaterialIcons name="search" size={24} color="#FFF" />
              <Text style={styles.buttonText}>Analizar alimento</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#690B22" />
          <Text style={styles.errorText}>No se recibió ninguna imagen</Text>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  image: {
    flex: 1,
    width: '100%',
    marginVertical: 20,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  analyzeButton: {
    backgroundColor: '#690B22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButtonLarge: {
    backgroundColor: '#690B22',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: 'bold',
  }
});
