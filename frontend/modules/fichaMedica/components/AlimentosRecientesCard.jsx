import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/fichaMedicaStyles';

const AlimentosRecientesCard = ({ 
  registrosAlimenticios, 
  navigation, 
  getNivelNutriente,
  computeAdjustedValues,
  unidadesMedida
}) => {
  // Función auxiliar para obtener el nombre y abreviación de la unidad
  const getUnidadInfo = (unidadId) => {
    if (!Array.isArray(unidadesMedida) || unidadesMedida.length === 0) {
      return { nombre: 'unidades', abreviacion: 'u' };
    }
    
    const unidad = unidadesMedida.find(u => u.id === unidadId);
    
    if (!unidad) {
      return { nombre: 'unidades', abreviacion: 'u' };
    }
    
    return {
      nombre: unidad.nombre || 'unidades',
      abreviacion: unidad.abreviacion || 'u'
    };
  };

  // Ordenar registros por fecha (del más reciente al más antiguo)
  const registrosOrdenados = [...registrosAlimenticios].sort((a, b) => {
    const fechaA = new Date(a.fecha_consumo);
    const fechaB = new Date(b.fecha_consumo);
    return fechaB - fechaA; // Orden descendente (más reciente primero)
  });

  return (
    <Card style={styles.card}>
      <Card.Title 
        title="Últimos Alimentos Consumidos" 
        titleStyle={styles.cardTitle}
        left={(props) => <MaterialIcons {...props} name="restaurant" size={24} color="#690B22" />}
      />
      <Card.Content>
        {registrosAlimenticios.length > 0 ? (
          <View style={styles.alimentosRecientesContainer}>
            {registrosOrdenados.slice(0, 5).map((registro, index) => {
              const alimento = typeof registro.alimento === 'object' 
                ? registro.alimento 
                : { nombre: 'Alimento no disponible', energia: 0, sodio: 0, fosforo: 0, potasio: 0 };
              
              // Ajustamos los valores nutricionales según la unidad de medida
              const valores = computeAdjustedValues(alimento, registro.unidad_medida);
              
              const fecha = new Date(registro.fecha_consumo);
              
              // Obtenemos la información de la unidad
              const unidadInfo = getUnidadInfo(registro.unidad_medida);
              
              return (
                <TouchableOpacity
                  key={registro.id || index}
                  style={styles.alimentoItemCard}
                  onPress={() => alimento.id && navigation.navigate('AlimentoDetailScreen', { alimentoId: alimento.id })}
                >
                  <View style={styles.alimentoItemHeader}>
                    <Text style={styles.alimentoItemNombre} numberOfLines={1}>
                      {alimento.nombre}
                    </Text>
                  </View>
                  
                  <View style={styles.alimentoItemContent}>
                    <View style={styles.alimentoItemTime}>
                      <MaterialIcons name="schedule" size={16} color="#666" />
                      <Text style={styles.alimentoItemTimeText}>
                        {fecha.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </Text>
                      <Text style={styles.alimentoItemDateText}>
                        {fecha.toLocaleDateString('es-ES', {day: 'numeric', month: 'short'})}
                      </Text>
                    </View>
                    
                    <View style={styles.cantidadContainer}>
                      <MaterialIcons 
                        name="straighten" 
                        size={16} 
                        color="#495057" 
                        style={styles.cantidadIcon}
                      />
                      <Text style={styles.cantidadText}>
                        {(() => {
                          const cantidad = registro.cantidad || 1;
                          const cantidadFormateada = cantidad % 1 === 0 ? cantidad.toString() : cantidad.toFixed(2).replace(/\.?0+$/, '');
                          return `${cantidadFormateada} ${unidadInfo.abreviacion} (${unidadInfo.nombre})`;
                        })()}
                      </Text>
                    </View>
                    
                    <Text style={styles.nutrientesTitulo}>Valores nutricionales:</Text>
                    <View style={styles.nutrientesGrid}>
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientLabel}>Calorías</Text>
                        <Text style={styles.nutrientValue}>{valores.energia}</Text>
                      </View>
                      
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientLabel}>Sodio</Text>
                        <Text style={styles.nutrientValue}>{valores.sodio} mg</Text>
                      </View>
                      
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientLabel}>Potasio</Text>
                        <Text style={styles.nutrientValue}>{valores.potasio} mg</Text>
                      </View>
                      
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientLabel}>Fósforo</Text>
                        <Text style={styles.nutrientValue}>{valores.fosforo} mg</Text>
                      </View>
                    </View>
                    
                    {registro.notas && (
                      <View style={styles.notasContainer}>
                        <MaterialIcons name="notes" size={16} color="#FFA000" />
                        <Text style={styles.notasText} numberOfLines={2}>
                          {registro.notas}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            
            <TouchableOpacity 
              style={styles.verMasButton}
              onPress={() => navigation.navigate('MisRegistros')}
            >
              <Text style={styles.verMasButtonText}>Ver todos mis registros</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#690B22" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noAlimentosContainer}>
            <MaterialIcons name="no-food" size={60} color="#690B22" opacity={0.8} />
            <Text style={styles.noAlimentosText}>
              No has registrado alimentos recientemente.
              ¡Registra tu comida para llevar un seguimiento nutricional!
            </Text>
            <TouchableOpacity 
              style={styles.registrarButton}
              onPress={() => {
                // Simplificar la navegación y usar el nombre correcto
                navigation.navigate('Alimentos');
              }}
            >
              <MaterialIcons name="add-circle-outline" size={18} color="#FFF" />
              <Text style={styles.registrarButtonText}>Registrar alimento</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default AlimentosRecientesCard;
