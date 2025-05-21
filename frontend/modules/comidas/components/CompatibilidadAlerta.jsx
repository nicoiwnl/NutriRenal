import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/minutaStyles';

const CompatibilidadAlerta = ({ compatibilidadInfo }) => {
  // Determinar nivel de alerta según porcentaje
  const getNivelAlerta = (porcentaje) => {
    if (porcentaje >= 80) return 'alta';
    if (porcentaje >= 60) return 'media';
    return 'baja';
  };
  
  // Obtener mensaje según criterios fallidos
  const getMensajeSegunCriterios = (criterios) => {
    if (criterios.length === 0) return "Esta minuta es compatible con tus necesidades";
    
    const mensajesCriterios = {
      bajo_en_sodio: "no cumple con tu restricción de sodio",
      bajo_en_potasio: "no cumple con tu restricción de potasio",
      bajo_en_fosforo: "no cumple con tu restricción de fósforo",
      bajo_en_proteinas: "no cumple con tu restricción de proteínas",
      tipo_dialisis: "no está diseñada para tu tipo de diálisis",
      genero: "no está diseñada para tu género", // Nuevo criterio
      calorias: "tiene un contenido calórico diferente al recomendado para ti"
    };
    
    // Limitamos a mencionar máximo 2 criterios para no sobrecargar
    const criteriosMostrados = criterios.slice(0, 2);
    const mensajesCriteriosMostrados = criteriosMostrados.map(c => mensajesCriterios[c] || c);
    
    let mensaje = "Esta minuta " + mensajesCriteriosMostrados.join(" y ");
    if (criterios.length > 2) {
      mensaje += ` (y ${criterios.length - 2} ${criterios.length - 2 === 1 ? 'criterio' : 'criterios'} más)`;
    }
    
    return mensaje;
  };
  
  // Get icon name based on compatibility level
  const getIconName = (nivel) => {
    switch(nivel) {
      case 'alta': return 'check-circle';
      case 'media': return 'info';
      default: return 'warning';
    }
  };
  
  const nivel = getNivelAlerta(compatibilidadInfo.porcentaje);
  const mensaje = getMensajeSegunCriterios(compatibilidadInfo.criteriosFallidos);
  const iconName = getIconName(nivel);
  
  return (
    <View style={[
      styles.compatibilidadAlerta,
      styles[`compatibilidadAlerta${nivel.charAt(0).toUpperCase() + nivel.slice(1)}`]
    ]}>
      <MaterialIcons 
        name={iconName} 
        size={24} 
        color={nivel === 'baja' ? '#856404' : nivel === 'media' ? '#724c0f' : '#155724'} 
      />
      
      <Text style={[
        styles.compatibilidadAlertaTexto,
        styles[`compatibilidadAlertaTexto${nivel.charAt(0).toUpperCase() + nivel.slice(1)}`]
      ]}>
        {mensaje}
      </Text>
      
      <Text style={[
        styles.compatibilidadPorcentaje,
        styles[`compatibilidadAlertaTexto${nivel.charAt(0).toUpperCase() + nivel.slice(1)}`]
      ]}>
        {compatibilidadInfo.porcentaje}%
      </Text>
    </View>
  );
};

export default CompatibilidadAlerta;
