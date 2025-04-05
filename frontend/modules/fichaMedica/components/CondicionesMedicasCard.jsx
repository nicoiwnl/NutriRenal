import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/fichaMedicaStyles';

const CondicionesMedicasCard = ({ 
  pacienteData, 
  mostrarSelectorCondiciones, 
  condicionesDisponibles,
  nuevasCondicionesSeleccionadas,
  toggleCondicionMedica,
  guardarCondicionesMedicas,
  cancelarSeleccionCondiciones,
  setMostrarSelectorCondiciones
}) => {
  return (
    <Card style={styles.card}>
      <Card.Title title="Condiciones Médicas" titleStyle={styles.cardTitle} />
      <Card.Content>
        {pacienteData?.condiciones && pacienteData.condiciones.length > 0 ? (
          <>
            <View style={styles.condicionesContainer}>
              {pacienteData.condiciones.map((condicion, index) => (
                <View key={index} style={styles.condicionBadge}>
                  <Text style={styles.condicionText}>{condicion.nombre}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.editCondicionesButton}
              onPress={() => setMostrarSelectorCondiciones(true)}
            >
              <MaterialIcons name="edit" size={18} color="#FFFFFF" />
              <Text style={styles.editCondicionesButtonText}>Editar condiciones</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.noCondicionesContainer}>
            <MaterialIcons name="medical-information" size={40} color="#E07A5F" style={styles.warningIcon} />
            <Text style={styles.noCondicionesText}>
              No hay condiciones médicas registradas. Agregar sus condiciones médicas ayudará a personalizar mejor sus recomendaciones nutricionales.
            </Text>
            <TouchableOpacity 
              style={styles.editCondicionesButton}
              onPress={() => {
                setMostrarSelectorCondiciones(true);
              }}
            >
              <MaterialIcons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.editCondicionesButtonText}>Agregar condiciones</Text>
            </TouchableOpacity>
          </View>
        )}

        {mostrarSelectorCondiciones && (
          <View style={styles.selectorCondiciones}>
            <Text style={styles.selectorTitle}>Seleccione sus condiciones médicas:</Text>
            
            {condicionesDisponibles.length > 0 ? (
              <>
                {condicionesDisponibles.map(condicion => (
                  <TouchableOpacity
                    key={condicion.id}
                    style={[
                      styles.condicionOption,
                      nuevasCondicionesSeleccionadas.some(c => c.id === condicion.id) && 
                      styles.condicionOptionSelected
                    ]}
                    onPress={() => toggleCondicionMedica(condicion)}
                  >
                    <Text style={[
                      styles.condicionOptionText,
                      nuevasCondicionesSeleccionadas.some(c => c.id === condicion.id) && 
                      styles.condicionOptionTextSelected
                    ]}>
                      {condicion.nombre}
                    </Text>
                    {nuevasCondicionesSeleccionadas.some(c => c.id === condicion.id) && (
                      <MaterialIcons name="check" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.emptyCondicionesContainer}>
                <Text style={styles.emptyText}>No hay condiciones médicas disponibles.</Text>
                <Text style={styles.emptySubText}>Contacte con el equipo médico para añadir nuevas condiciones.</Text>
              </View>
            )}
            
            <View style={styles.selectorButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={cancelarSeleccionCondiciones}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={guardarCondicionesMedicas}
              >
                <Text style={styles.actionButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default CondicionesMedicasCard;
