import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Switch } from 'react-native-paper';
import styles from '../styles/minutaStyles';

const RestriccionesForm = ({ 
  visible, 
  restricciones, 
  onChangeRestriccion, 
  onConfirmar, 
  onCancelar,
  loading 
}) => {
  // Función para desactivar todas las restricciones
  const desactivarTodasLasRestricciones = () => {
    onChangeRestriccion('bajo_en_sodio', false);
    onChangeRestriccion('bajo_en_potasio', false);
    onChangeRestriccion('bajo_en_fosforo', false);
    onChangeRestriccion('bajo_en_proteinas', false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancelar}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Preferencias y restricciones</Text>
            <TouchableOpacity onPress={onCancelar} style={styles.formClose}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formScroll}>
            <Text style={styles.formDescription}>
              Selecciona las restricciones dietéticas que apliquen a tu caso para personalizar tu plan alimentario.
            </Text>
            
            {/* Botón para desactivar todas las restricciones */}
            <TouchableOpacity 
              style={styles.noRestriccionesButton}
              onPress={desactivarTodasLasRestricciones}
            >
              <MaterialIcons name="block" size={20} color="#666" />
              <Text style={styles.noRestriccionesText}>
                No quiero aplicar restricciones dietéticas
              </Text>
            </TouchableOpacity>
            
            <View style={styles.restriccionItem}>
              <View style={styles.restriccionInfo}>
                <Text style={styles.restriccionTitle}>Bajo en sodio</Text>
                <Text style={styles.restriccionDesc}>
                  Alimentos con contenido reducido de sal y sodio
                </Text>
              </View>
              <Switch
                value={restricciones.bajo_en_sodio}
                onValueChange={(value) => onChangeRestriccion('bajo_en_sodio', value)}
                color="#690B22"
              />
            </View>
            
            <View style={styles.restriccionItem}>
              <View style={styles.restriccionInfo}>
                <Text style={styles.restriccionTitle}>Bajo en potasio</Text>
                <Text style={styles.restriccionDesc}>
                  Alimentos con contenido reducido de potasio
                </Text>
              </View>
              <Switch
                value={restricciones.bajo_en_potasio}
                onValueChange={(value) => onChangeRestriccion('bajo_en_potasio', value)}
                color="#690B22"
              />
            </View>
            
            <View style={styles.restriccionItem}>
              <View style={styles.restriccionInfo}>
                <Text style={styles.restriccionTitle}>Bajo en fósforo</Text>
                <Text style={styles.restriccionDesc}>
                  Alimentos con contenido reducido de fósforo
                </Text>
              </View>
              <Switch
                value={restricciones.bajo_en_fosforo}
                onValueChange={(value) => onChangeRestriccion('bajo_en_fosforo', value)}
                color="#690B22"
              />
            </View>
            
            <View style={styles.restriccionItem}>
              <View style={styles.restriccionInfo}>
                <Text style={styles.restriccionTitle}>Bajo en proteínas</Text>
                <Text style={styles.restriccionDesc}>
                  Alimentos con contenido reducido de proteínas
                </Text>
              </View>
              <Switch
                value={restricciones.bajo_en_proteinas}
                onValueChange={(value) => onChangeRestriccion('bajo_en_proteinas', value)}
                color="#690B22"
              />
            </View>
            
            <View style={styles.formTips}>
              <MaterialIcons name="info-outline" size={20} color="#1976D2" />
              <Text style={styles.formTipsText}>
                Estas preferencias ayudarán al sistema a asignarte un plan alimentario adecuado para tu condición renal.
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.formButtons}>
            <TouchableOpacity 
              style={styles.formCancelButton}
              onPress={onCancelar}
              disabled={loading}
            >
              <Text style={styles.formCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.formConfirmButton}
              onPress={onConfirmar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.formConfirmButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RestriccionesForm;
