import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { formatearRut } from '../../../utils/rutHelper';
import { getImageUrl } from '../../../utils/imageHelper';
import styles from '../styles/fichaMedicaStyles';

const HeaderCard = ({ 
  pacienteData, 
  userRole, 
  selectedPatientId, 
  showPhotoOptions, 
  photoPreview, 
  uploadingPhoto, 
  showPhotoOptionsMenu 
}) => {
  return (
    <Card style={styles.headerCard}>
      <View style={styles.headerRow}>
        {!selectedPatientId && userRole === 'paciente' ? (
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={showPhotoOptionsMenu}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <View style={[styles.profileImage, styles.uploadingContainer]}>
                <ActivityIndicator size="large" color="#690B22" />
                <Text style={styles.uploadingText}>Subiendo...</Text>
              </View>
            ) : (
              <>
                <Image 
                  source={{ 
                    uri: photoPreview || getImageUrl(
                      pacienteData?.paciente?.foto_perfil,
                      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                    )
                  }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                {Platform.OS !== 'web' && (
                  <View style={styles.cameraIconContainer}>
                    <MaterialIcons name="photo-camera" size={20} color="#FFFFFF" />
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        ) : (
          <Image 
            source={{ 
              uri: getImageUrl(
                pacienteData?.paciente?.foto_perfil,
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
              )
            }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.headerInfo}>
          <View style={styles.rutContainer}>
            <Text style={styles.rutLabel}>RUT</Text>
            <Text style={styles.rutValue}>
              {pacienteData?.paciente?.rut ? 
                formatearRut(pacienteData.paciente.rut) : 
                'No disponible'}
            </Text>
          </View>
          
          <Text style={styles.nombreLabel}>Nombres:</Text>
          <Text style={styles.nombreValue}>{pacienteData?.paciente?.nombres || 'No disponible'}</Text>
          
          <Text style={styles.nombreLabel}>Apellidos:</Text>
          <Text style={styles.nombreValue}>{pacienteData?.paciente?.apellidos || 'No disponible'}</Text>
          
        </View>
      </View>
    </Card>
  );
};

export default HeaderCard;
