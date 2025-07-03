import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/registrosStyles';

const ResumenDiario = ({ selectedDate, registrosFiltrados, totalesDiarios, formatDateInSpanish, getNutrientDailyColor }) => {
  if (!selectedDate) return null;
  
  const formattedDate = formatDateInSpanish(selectedDate);
  
  const sodioColor = getNutrientDailyColor('sodio', totalesDiarios.sodio);
  const fosforoColor = getNutrientDailyColor('fosforo', totalesDiarios.fosforo);
  const potasioColor = getNutrientDailyColor('potasio', totalesDiarios.potasio);
  
  const showInfoAlert = () => {
    Alert.alert(
      "Rangos recomendados diarios", 
      "Para pacientes renales:\n\n• Sodio: 1300-1700 mg/día\n• Potasio: 1800-2000 mg/día\n• Fósforo: 800-1000 mg/día\n\nConsulta siempre con tu médico para recomendaciones personalizadas.",
      [{ text: "Entendido" }]
    );
  };
  
  return (
    <Card style={styles.resumenCard}>
      <Card.Content style={styles.resumenContent}>
        <View style={styles.resumenHeader}>
          <Text style={styles.resumenTitle}>{formattedDate}</Text>
          <View style={styles.resumenSubtitleContainer}>
            <Text style={styles.resumenSubtitle}>
              {registrosFiltrados.length} alimentos
            </Text>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={showInfoAlert}
            >
              <MaterialIcons name="info-outline" size={14} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.resumenStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(totalesDiarios.calorias)}</Text>
            <Text style={styles.statLabel}>Calorías</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: sodioColor }]}>
              {Math.round(totalesDiarios.sodio)}
            </Text>
            <Text style={styles.statLabel}>Sodio</Text>
            <Text style={styles.rangeText}>1300-1700mg</Text>
            {totalesDiarios.sodio > 1300 && (
              <MaterialIcons 
                name="warning" 
                size={14} 
                color={sodioColor} 
                style={styles.warningIcon} 
              />
            )}
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: fosforoColor }]}>
              {Math.round(totalesDiarios.fosforo)}
            </Text>
            <Text style={styles.statLabel}>Fósforo</Text>
            <Text style={styles.rangeText}>800-1000mg</Text>
            {totalesDiarios.fosforo > 800 && (
              <MaterialIcons 
                name="warning" 
                size={14} 
                color={fosforoColor} 
                style={styles.warningIcon} 
              />
            )}
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: potasioColor }]}>
              {Math.round(totalesDiarios.potasio)}
            </Text>
            <Text style={styles.statLabel}>Potasio</Text>
            <Text style={styles.rangeText}>1800-2000mg</Text>
            {totalesDiarios.potasio > 1800 && (
              <MaterialIcons 
                name="warning" 
                size={14} 
                color={potasioColor}
                style={styles.warningIcon} 
              />
            )}
          </View>
        </View>
        
        {(totalesDiarios.sodio > 1300 || totalesDiarios.potasio > 1800 || totalesDiarios.fosforo > 800) && (
          <View style={styles.dailyWarningContainer}>
            <MaterialIcons name="info-outline" size={16} color="#F44336" />
            <Text style={styles.dailyWarningText}>
              Al menos un nutriente se acerca o supera los límites diarios recomendados
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default ResumenDiario;
