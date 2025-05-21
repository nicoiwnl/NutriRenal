import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/minutaStyles';
import api from '../../../api';
import { calcularCalorias, determinarCategoriaCalorías } from '../../../utils/calculosNutricionales';

const NoMinutaCard = ({ pacienteData, onSolicitarMinuta }) => {
  const [personaData, setPersonaData] = useState(null);
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [caloriasInfo, setCaloriasInfo] = useState(null);

  // Cargar datos de la persona desde el endpoint correcto
  useEffect(() => {
    const fetchPersonaData = async () => {
      if (!pacienteData?.id_persona) return;
      
      try {
        setLoadingPersona(true);
        const response = await api.get(`/personas/${pacienteData.id_persona}/`);
        setPersonaData(response.data);
        console.log("Datos de persona cargados:", response.data);
        
        // Calcular calorías necesarias y determinar categoría
        if (pacienteData && response.data) {
          const genero = response.data.genero || 'Masculino';
          const peso = parseFloat(pacienteData.peso) || 70;
          const altura = parseFloat(pacienteData.altura) || 1.70;
          const edad = response.data.edad || 40;
          const nivelActividad = pacienteData.nivel_actividad || 'moderado';
          
          // Calcular calorías exactas (sin categorizar)
          const caloriasExactas = calcularCalorias(genero, peso, altura, edad, nivelActividad, true, false);
          
          // Determinar categoría más cercana
          const infoCategorias = determinarCategoriaCalorías(caloriasExactas);
          
          setCaloriasInfo({
            caloriasExactas,
            categoriaRecomendada: infoCategorias.categoria,
            diferencia: infoCategorias.diferencia
          });
        }
      } catch (error) {
        console.error("Error al cargar datos de persona:", error);
      } finally {
        setLoadingPersona(false);
      }
    };

    fetchPersonaData();
  }, [pacienteData]);

  const formatearAltura = (altura) => {
    return altura ? `${parseFloat(altura).toFixed(2)} m` : 'No disponible';
  };

  const formatearPeso = (peso) => {
    return peso ? `${parseFloat(peso).toFixed(1)} kg` : 'No disponible';
  };

  // Función para mostrar el tipo de diálisis correctamente formateado
  const formatearTipoDialisis = (tipo) => {
    if (!tipo) return 'No especificado';
    
    // Normalizar el formato eliminando guiones bajos y pasando a minúsculas
    const tipoNormalizado = tipo.toLowerCase().replace(/_/g, ' ');
    
    switch (tipoNormalizado) {
      case 'hemodialisis':
        return 'Hemodiálisis';
      case 'peritoneal':
      case 'dialisis peritoneal':
        return 'Diálisis Peritoneal';
      case 'ambas':
        return 'Ambos tipos';
      default:
        // Capitalizar primera letra de cada palabra
        return tipoNormalizado
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  // Función para formatear el género desde el endpoint de personas
  const formatearGenero = () => {
    // Primero intentar obtener el género desde los datos de persona (endpoint correcto)
    if (personaData?.genero) {
      if (personaData.genero === 'M') return 'Masculino';
      if (personaData.genero === 'F') return 'Femenino';
      return personaData.genero;
    }
    
    // Fallback a cualquier otra fuente de datos si está disponible
    if (pacienteData?.genero) {
      if (pacienteData.genero === 'M') return 'Masculino';
      if (pacienteData.genero === 'F') return 'Femenino';
      return pacienteData.genero;
    }
    
    return 'No disponible';
  };

  return (
    <View style={styles.noMinutaCard}>
      <View style={styles.noMinutaHeader}>
        <MaterialIcons name="assignment" size={40} color="#690B22" />
        <Text style={styles.noMinutaTitle}>No tienes un plan alimentario asignado</Text>
      </View>
      
      <View style={styles.infoMedicaContainer}>
        <Text style={styles.infoMedicaTitle}>Información médica actual:</Text>
        
        <View style={styles.infoMedicaItem}>
          <Text style={styles.infoMedicaLabel}>Altura:</Text>
          <Text style={styles.infoMedicaValue}>{formatearAltura(pacienteData?.altura)}</Text>
        </View>
        
        <View style={styles.infoMedicaItem}>
          <Text style={styles.infoMedicaLabel}>Peso:</Text>
          <Text style={styles.infoMedicaValue}>{formatearPeso(pacienteData?.peso)}</Text>
        </View>
        
        {/* Campo de género usando datos del API de personas */}
        <View style={styles.infoMedicaItem}>
          <Text style={styles.infoMedicaLabel}>Género:</Text>
          {loadingPersona ? (
            <ActivityIndicator size="small" color="#690B22" />
          ) : (
            <Text style={styles.infoMedicaValue}>
              {formatearGenero()}
            </Text>
          )}
        </View>
        
        <View style={styles.infoMedicaItem}>
          <Text style={styles.infoMedicaLabel}>Tipo de diálisis:</Text>
          <Text style={styles.infoMedicaValue}>
            {formatearTipoDialisis(pacienteData?.tipo_dialisis)}
          </Text>
        </View>
        
        <View style={styles.infoMedicaItem}>
          <Text style={styles.infoMedicaLabel}>Nivel de actividad:</Text>
          <Text style={styles.infoMedicaValue}>
            {pacienteData?.nivel_actividad === 'sedentario' ? 'Sedentario' :
             pacienteData?.nivel_actividad === 'ligera' ? 'Ligera' :
             pacienteData?.nivel_actividad === 'moderada' ? 'Moderada' :
             pacienteData?.nivel_actividad === 'alta' ? 'Alta' :
             pacienteData?.nivel_actividad === 'muy alta' ? 'Muy alta' :
             'No especificado'}
          </Text>
        </View>
        
        {/* Información sobre calorías calculadas */}
        {caloriasInfo && (
          <View style={styles.caloriasInfoContainer}>
            <View style={styles.infoMedicaItem}>
              <Text style={styles.infoMedicaLabel}>Calorías necesarias:</Text>
              <Text style={styles.infoMedicaValueHighlighted}>
                {caloriasInfo.caloriasExactas} kcal/día
              </Text>
            </View>
            
            <View style={styles.infoMedicaItem}>
              <Text style={styles.infoMedicaLabel}>Plan alimentario recomendado:</Text>
              <Text style={styles.infoMedicaValueHighlighted}>
                {caloriasInfo.categoriaRecomendada} kcal
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.noMinutaInfo}>
        <Text style={styles.noMinutaDescription}>
          Puedes solicitar un plan alimentario personalizado según tus necesidades nutricionales y restricciones dietéticas.
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.solicitarButton}
        onPress={onSolicitarMinuta}
      >
        <MaterialIcons name="restaurant-menu" size={20} color="#fff" />
        <Text style={styles.solicitarButtonText}>Solicitar plan alimentario</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoMinutaCard;
