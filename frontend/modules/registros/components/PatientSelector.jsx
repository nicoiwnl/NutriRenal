import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getImageUrl } from '../../../utils/imageHelper';
import styles from '../styles/registrosStyles';

const PatientSelector = ({ linkedPatients, onSelectPatient }) => {
  return (
    <View style={styles.instructionContainer}>
      <Text style={styles.linkedPatientsTitle}>
        Seleccione un paciente para ver sus registros alimentarios:
      </Text>
      
      <View style={styles.linkedPatientsContainer}>
        {linkedPatients.map((patient, index) => {
          const name = patient.nombre || "Paciente sin nombre";
          const age = patient.edad || "N/A";
          const gender = patient.genero || "No especificado";
          const id = patient.paciente_id || patient.id || `patient_${index}`;
          
          return (
            <TouchableOpacity 
              key={index.toString()}
              style={styles.patientCard}
              onPress={() => onSelectPatient(id)}
              activeOpacity={0.8}
            >
              <Image 
                source={{ 
                  uri: getImageUrl(
                    patient.foto_perfil,
                    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                  )
                }}
                style={styles.patientCardImage}
                resizeMode="cover"
              />
              <View style={styles.simpleCardInfo}>
                <Text style={styles.simpleCardName}>{name}</Text>
                <Text style={styles.simpleCardDetail}>Edad: {age} años</Text>
                <Text style={styles.simpleCardDetail}>Género: {gender}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#690B22" style={{opacity: 0.7}} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PatientSelector;
