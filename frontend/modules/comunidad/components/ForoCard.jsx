import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getImageUrl } from '../../../utils/imageHelper';

const ForoCard = ({ foro, isSuscrito, onPress, onToggleSuscripcion }) => {
  // Validar props para evitar errores
  if (!foro || !foro.id) {
    console.error('Error: Datos de foro incompletos', foro);
    return null;
  }
  
  // Flag para indicar si es el foro general (no se puede modificar suscripción)
  const isGeneralForum = foro.id === '76b6de3f-89af-46b1-9874-147f8cbe0391' || foro.es_general === true;

  const handleToggleSuscripcion = async (e) => {
    e.stopPropagation(); // Evitar que se active el onPress del card
    
    // No permitir cambiar suscripción al foro general
    if (isGeneralForum) {
      alert('No puedes cambiar la suscripción al foro general');
      return;
    }
    
    // Llamar a la función para cambiar suscripción
    const success = await onToggleSuscripcion(foro.id);
    
    // Log para debugging
    console.log(`Resultado de cambio de suscripción: ${success ? 'Éxito' : 'Fallo'}`);
  };

  // URL por defecto para imágenes de foro
  const defaultForoImage = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9ydW18ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";

  return (
    <TouchableOpacity 
      style={[styles.card, isSuscrito && styles.cardSuscrito]}
      onPress={() => onPress(foro)}
    >
      <View style={styles.cardContent}>
        {/* Imagen del foro */}
        <Image 
          source={{ uri: getImageUrl(foro.imagen, defaultForoImage) }}
          style={styles.foroImage}
          resizeMode="cover"
        />
        
        <View style={styles.foroInfo}>
          <Text style={styles.foroNombre}>
            {foro.nombre || 'Foro sin nombre'}
            {isGeneralForum && <Text style={styles.generalBadge}> (General)</Text>}
          </Text>
          {foro.descripcion ? (
            <Text style={styles.foroDescripcion} numberOfLines={2}>
              {foro.descripcion}
            </Text>
          ) : null}
        </View>
        
        {/* Botón de suscripción (deshabilitado para el foro general) */}
        <TouchableOpacity 
          style={[
            styles.suscripcionButton,
            isSuscrito ? styles.suscritoButton : styles.noSuscritoButton,
            isGeneralForum && styles.suscripcionButtonDisabled
          ]}
          onPress={handleToggleSuscripcion}
          disabled={isGeneralForum}
        >
          <MaterialIcons
            name={isSuscrito ? "check-circle" : "add-circle-outline"}
            size={20}
            color={isSuscrito ? "#FFF" : "#690B22"}
          />
          <Text style={[
            styles.suscripcionText,
            isSuscrito ? styles.suscritoText : styles.noSuscritoText
          ]}>
            {isGeneralForum ? 'Acceso' : (isSuscrito ? 'Suscrito' : 'Suscribirse')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderLeftWidth: 4,
    borderLeftColor: '#F1E3D3',
  },
  cardSuscrito: {
    borderLeftColor: '#1B4D3E',
    backgroundColor: '#F8F9FA',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foroInfo: {
    flex: 1,
    marginLeft: 12,
  },
  foroNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  generalBadge: {
    fontStyle: 'italic',
    fontWeight: 'normal',
    fontSize: 14,
  },
  foroDescripcion: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  suscripcionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suscritoButton: {
    backgroundColor: '#1B4D3E',
  },
  noSuscritoButton: {
    backgroundColor: '#F1E3D3',
    borderWidth: 1,
    borderColor: '#690B22',
  },
  suscripcionButtonDisabled: {
    backgroundColor: '#4CAF50',
    opacity: 0.8,
    borderWidth: 0,
  },
  suscripcionText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  suscritoText: {
    color: '#FFFFFF',
  },
  noSuscritoText: {
    color: '#690B22',
  },
  foroImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
});

export default ForoCard;
