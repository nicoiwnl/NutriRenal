import React from 'react';
import { View, Text, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getProfileImageUrl } from '../../../utils/imageHelper';
import styles from '../styles/registrosStyles';

const RegistroItem = ({ item, formatDate, getNutrientColor, userData, unidadesMedida }) => {
  const alimento = item.detalleAlimento;
  if (!alimento) return null;
  
  // Buscar la unidad de medida del registro en el array de unidades
  const unidad = unidadesMedida.find(u => u.id === item.unidad_medida);
  
  // Si tenemos unidad, mostrar el nombre real, de lo contrario mostrar un mensaje informativo
  const unidadNombre = unidad 
    ? unidad.nombre 
    : item.unidad_medida 
      ? `Unidad ${item.unidad_medida}` 
      : 'Valor por defecto (100 ml/gr)';
  
  const getAdjustedValue = (baseValue, unidad) => {
    let factor = 1;
    if (unidad) {
      if (unidad.es_volumen && unidad.equivalencia_ml) {
        factor = Number(unidad.equivalencia_ml) / 100;
      } else if (!unidad.es_volumen && unidad.equivalencia_g) {
        factor = Number(unidad.equivalencia_g) / 100;
      }
    }
    return baseValue ? Math.round(baseValue * factor) : 0;
  };
  
  const adjusted = {
    energia: getAdjustedValue(alimento.energia, unidad),
    sodio: getAdjustedValue(alimento.sodio, unidad),
    potasio: getAdjustedValue(alimento.potasio, unidad),
    fosforo: getAdjustedValue(alimento.fosforo, unidad)
  };
  
  const sodioColor = getNutrientColor('sodio', adjusted.sodio);
  const fosforoColor = getNutrientColor('fosforo', adjusted.fosforo);
  const potasioColor = getNutrientColor('potasio', adjusted.potasio);
  
  const pacienteInfo = userData?.role === 'cuidador' ? item.paciente : null;

  return (
    <Card style={styles.registroCard}>
      <Card.Content>
        {userData?.role === 'cuidador' && pacienteInfo && (
          <View style={styles.pacienteInfoContainer}>
            <Image
              source={{ 
                uri: getProfileImageUrl(pacienteInfo.foto_perfil)
              }}
              style={styles.pacienteImage}
              resizeMode="cover"
            />
            <View style={styles.pacienteDetails}>
              <Text style={styles.pacienteNombre} numberOfLines={1}>
                {pacienteInfo.nombre || 'Paciente'}
              </Text>
              {pacienteInfo.rut && (
                <Text style={styles.pacienteRut} numberOfLines={1}>
                  RUT: {pacienteInfo.rut}
                </Text>
              )}
            </View>
          </View>
        )}
        <Text style={styles.alimentoNombre}>{alimento.nombre}</Text>
        
        <View style={styles.unidadContainer}>
          <MaterialIcons name="straighten" size={16} color="#690B22" />
          <Text style={styles.unidadText}>
            {unidadNombre}
          </Text>
        </View>
        
        <View style={styles.alimentoInfo}>
          <View style={styles.alimentoDatos}>
            <View style={styles.nutrientGrid}>
              <View style={styles.nutrientGridItem}>
                <MaterialIcons name="local-fire-department" size={16} color="#FF9800" />
                <Text style={styles.nutrientGridLabel}>Calorías:</Text>
                <Text style={styles.nutrientGridValue}>{adjusted.energia} kcal</Text>
              </View>
              
              <View style={styles.nutrientGridItem}>
                <View style={[styles.nutrientIndicator, { backgroundColor: sodioColor }]} />
                <Text style={styles.nutrientGridLabel}>Sodio:</Text>
                <Text style={styles.nutrientGridValue}>{adjusted.sodio} mg</Text>
              </View>
              
              <View style={styles.nutrientGridItem}>
                <View style={[styles.nutrientIndicator, { backgroundColor: potasioColor }]} />
                <Text style={styles.nutrientGridLabel}>Potasio:</Text>
                <Text style={styles.nutrientGridValue}>{adjusted.potasio} mg</Text>
              </View>
              
              <View style={styles.nutrientGridItem}>
                <View style={[styles.nutrientIndicator, { backgroundColor: fosforoColor }]} />
                <Text style={styles.nutrientGridLabel}>Fósforo:</Text>
                <Text style={styles.nutrientGridValue}>{adjusted.fosforo} mg</Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text style={styles.fechaConsumo}>
          {formatDate(item.fecha_consumo)}
        </Text>
        
        {item.notas && (
          <Text style={styles.notasTexto}>Notas: {item.notas}</Text>
        )}
      </Card.Content>
    </Card>
  );
};

export default RegistroItem;
