import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/fichaMedicaStyles';

const InformacionMedicaCard = ({ 
  pacienteData, 
  editMode, 
  tempValues, 
  activarEdicion, 
  cancelarEdicion, 
  guardarEdicion, 
  setTempValues, 
  formatearAltura 
}) => {
  if (!pacienteData?.perfil_medico || !pacienteData.perfil_medico.id) {
    return (
      <Card style={styles.card}>
        <Card.Title title="Información Médica" titleStyle={styles.cardTitle} />
        <Card.Content>
          <View style={styles.noProfileContainer}>
            <MaterialIcons name="warning" size={40} color="#E07A5F" style={styles.warningIcon} />
            <Text style={styles.noProfileText}>
              No se ha encontrado información médica. 
              Por favor, complete su perfil médico para poder visualizar y gestionar su información.
            </Text>
            <TouchableOpacity 
              style={styles.scrollToCreateButton}
              onPress={() => {
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  const element = document.querySelector('.createProfileCard');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
            >
              <Text style={styles.scrollToCreateButtonText}>Ir a Crear Perfil</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Title title="Información Médica" titleStyle={styles.cardTitle} />
      <Card.Content>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo de diálisis:</Text>
          {editMode.tipo_dialisis ? (
            <View style={styles.editableValueContainer}>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempValues.tipo_dialisis === 'hemodialisis' && styles.optionButtonSelected
                  ]}
                  onPress={() => setTempValues(prev => ({ ...prev, tipo_dialisis: 'hemodialisis' }))}
                >
                  <Text style={tempValues.tipo_dialisis === 'hemodialisis' ? styles.optionTextSelected : styles.optionText}>
                    Hemodiálisis
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempValues.tipo_dialisis === 'dialisis_peritoneal' && styles.optionButtonSelected
                  ]}
                  onPress={() => setTempValues(prev => ({ ...prev, tipo_dialisis: 'dialisis_peritoneal' }))}
                >
                  <Text style={tempValues.tipo_dialisis === 'dialisis_peritoneal' ? styles.optionTextSelected : styles.optionText}>
                    Diálisis Peritoneal
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.editActionsContainer}>
                <TouchableOpacity 
                  style={[styles.editActionButton, styles.saveButton]}
                  onPress={() => guardarEdicion('tipo_dialisis')}
                >
                  <MaterialIcons name="check" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editActionButton, styles.cancelButton]}
                  onPress={() => cancelarEdicion('tipo_dialisis')}
                >
                  <MaterialIcons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.infoValue}>
                {pacienteData?.perfil_medico?.tipo_dialisis === 'hemodialisis' ? 'Hemodiálisis' : 'Diálisis Peritoneal'}
              </Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => activarEdicion('tipo_dialisis')}
              >
                <MaterialIcons name="edit" size={18} color="#690B22" />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Peso:</Text>
          {editMode.peso ? (
            <View style={styles.editableValueContainer}>
              <TextInput
                style={styles.editableInput}
                value={tempValues.peso}
                onChangeText={(text) => setTempValues(prev => ({ ...prev, peso: text }))}
                keyboardType="numeric"
                autoFocus
              />
              <Text style={styles.unitText}>kg</Text>
              <View style={styles.editActionsContainer}>
                <TouchableOpacity 
                  style={[styles.editActionButton, styles.saveButton]}
                  onPress={() => guardarEdicion('peso')}
                >
                  <MaterialIcons name="check" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editActionButton, styles.cancelButton]}
                  onPress={() => cancelarEdicion('peso')}
                >
                  <MaterialIcons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.infoValue}>
                {`${pacienteData.perfil_medico.peso} kg`}
              </Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => activarEdicion('peso')}
              >
                <MaterialIcons name="edit" size={18} color="#690B22" />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Altura:</Text>
          {editMode.altura ? (
            <View style={styles.editableValueContainer}>
              <TextInput
                style={styles.editableInput}
                value={tempValues.altura}
                onChangeText={(text) => {
                  const normalizedText = text.replace(',', '.').replace(/[^\d.]/g, '');
                  setTempValues(prev => ({ ...prev, altura: normalizedText }))
                }}
                keyboardType="numeric"
                autoFocus
              />
              <Text style={styles.unitText}>m</Text>
              <View style={styles.editActionsContainer}>
                <TouchableOpacity 
                  style={[styles.editActionButton, styles.saveButton]}
                  onPress={() => guardarEdicion('altura')}
                >
                  <MaterialIcons name="check" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editActionButton, styles.cancelButton]}
                  onPress={() => cancelarEdicion('altura')}
                >
                  <MaterialIcons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.infoValue}>
                {`${formatearAltura(pacienteData.perfil_medico.altura)} m`}
              </Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => activarEdicion('altura')}
              >
                <MaterialIcons name="edit" size={18} color="#690B22" />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>IMC:</Text>
          <Text style={[
            styles.infoValue,
            pacienteData?.perfil_medico?.imc ? styles.calculatedValue : styles.placeholderValue
          ]}>
            {pacienteData?.perfil_medico?.imc && pacienteData.perfil_medico.imc > 0 ? 
              `${pacienteData.perfil_medico.imc} kg/m²` : 
              'Calculando...'}
          </Text>
          <View style={styles.autoCalcIcon}>
            <MaterialIcons name="calculate" size={18} color="#888" />
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nivel de Actividad:</Text>
          {editMode.nivel_actividad ? (
            <View style={styles.editableValueContainer}>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempValues.nivel_actividad === 'sedentario' && styles.optionButtonSelected
                  ]}
                  onPress={() => setTempValues(prev => ({ ...prev, nivel_actividad: 'sedentario' }))}
                >
                  <Text style={tempValues.nivel_actividad === 'sedentario' ? styles.optionTextSelected : styles.optionText}>
                    Sedentario
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempValues.nivel_actividad === 'ligera' && styles.optionButtonSelected
                  ]}
                  onPress={() => setTempValues(prev => ({ ...prev, nivel_actividad: 'ligera' }))}
                >
                  <Text style={tempValues.nivel_actividad === 'ligera' ? styles.optionTextSelected : styles.optionText}>
                    Ligera
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempValues.nivel_actividad === 'moderada' && styles.optionButtonSelected
                  ]}
                  onPress={() => setTempValues(prev => ({ ...prev, nivel_actividad: 'moderada' }))}
                >
                  <Text style={tempValues.nivel_actividad === 'moderada' ? styles.optionTextSelected : styles.optionText}>
                    Moderada
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    tempValues.nivel_actividad === 'alta' && styles.optionButtonSelected
                  ]}
                  onPress={() => setTempValues(prev => ({ ...prev, nivel_actividad: 'alta' }))}
                >
                  <Text style={tempValues.nivel_actividad === 'alta' ? styles.optionTextSelected : styles.optionText}>
                    Alta
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.editActionsContainer}>
                <TouchableOpacity 
                  style={[styles.editActionButton, styles.saveButton]}
                  onPress={() => guardarEdicion('nivel_actividad')}
                >
                  <MaterialIcons name="check" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editActionButton, styles.cancelButton]}
                  onPress={() => cancelarEdicion('nivel_actividad')}
                >
                  <MaterialIcons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={[
                styles.infoValue,
                pacienteData?.perfil_medico?.nivel_actividad ? styles.calculatedValue : styles.placeholderValue
              ]}>
                {pacienteData?.perfil_medico?.nivel_actividad ? 
                  pacienteData.perfil_medico.nivel_actividad.charAt(0).toUpperCase() + 
                  pacienteData.perfil_medico.nivel_actividad.slice(1) : 
                  'No especificado'}
              </Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => activarEdicion('nivel_actividad')}
              >
                <MaterialIcons name="edit" size={18} color="#690B22" />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Calorías diarias:</Text>
          <Text style={[
            styles.infoValue,
            pacienteData?.perfil_medico?.calorias_diarias ? styles.calculatedValue : styles.placeholderValue
          ]}>
            {pacienteData?.perfil_medico?.calorias_diarias && pacienteData.perfil_medico.calorias_diarias > 0 ? 
              `${Math.round(pacienteData.perfil_medico.calorias_diarias)} kcal` : 
              'Calculando...'}
          </Text>
          <View style={styles.autoCalcIcon}>
            <MaterialIcons name="calculate" size={18} color="#888" />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default InformacionMedicaCard;
