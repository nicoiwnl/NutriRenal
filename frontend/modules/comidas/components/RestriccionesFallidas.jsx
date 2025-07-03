import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/minutaStyles';

const RestriccionesFallidas = ({ criteriosFallidos }) => {
  if (!criteriosFallidos || criteriosFallidos.length === 0) return null;

  // Objeto con explicaciones detalladas de cada restricción
  const explicacionesRestricciones = {
    bajo_en_sodio: "Restricción de sodio requerida para tu condición renal",
    bajo_en_potasio: "Restricción de potasio requerida para tu condición renal",
    bajo_en_fosforo: "Restricción de fósforo requerida para tu condición renal",
    bajo_en_proteinas: "Restricción de proteínas requerida para tu condición renal",
    tipo_dialisis: "Recomendaciones específicas para tu tipo de diálisis",
    genero: "Necesidades nutricionales específicas para tu género",
    calorias: "Balance calórico adecuado para tu metabolismo"
  };

  // Agregar dentro de view la funcion de los criterios por ahora se deja comentado
  return (
    <View>
    </View>
  );
};

export default RestriccionesFallidas;

/*       <View style={styles.restriccionesFallidasHeader}>
        <MaterialIcons name="info-outline" size={20} color="#690B22" />
        <Text style={styles.restriccionesFallidasTitle}>
          Aspectos a tener en cuenta en este plan
        </Text>
      </View>
      
      {criteriosFallidos.map((criterio, index) => (
        <View key={index} style={styles.restriccionFallidaItem}>
          <MaterialIcons name="warning" size={16} color="#E07A5F" />
          <Text style={styles.restriccionFallidaTexto}>
            {explicacionesRestricciones[criterio] || `Criterio no cumplido: ${criterio}`}
          </Text>
        </View>
      ))}

      <Text style={styles.restriccionesFallidasNota}>
        Consulta con tu nutricionista sobre estos aspectos para mejorar tu alimentación.
      </Text>
    */

