import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/minutaStyles';
import DiaSelectorMinuta from './DiaSelectorMinuta';
import CompatibilidadAlerta from './CompatibilidadAlerta'; 
import RestriccionesFallidas from './RestriccionesFallidas';
import { getImageUrl } from '../../../config/apiConfig';

const MinutaDetail = ({ 
  minuta, 
  comidas, 
  tiposComida, 
  currentDay, 
  onChangeDay,
  onVerDetalleComida,
  onRevocarPlan,
  compatibilidadMinuta // Nuevo prop para recibir información de compatibilidad
}) => {
  // Función para agrupar comidas y seleccionar UNA POR TIPO
  const agruparComidasPorTipo = () => {
    const grupos = {};
    
    // Inicializar grupos con los tipos disponibles
    tiposComida.forEach(tipo => {
      grupos[tipo.id] = {
        nombre: tipo.nombre,
        comida: null
      };
    });
    
    // Para cada comida, asignarla a su grupo correspondiente
    // Las comidas ya vienen filtradas por día desde la API
    comidas.forEach(comida => {
      const tipoId = comida.comida_tipo;
      if (grupos[tipoId]) {
        // Si ya hay una comida asignada, mostrar advertencia
        if (grupos[tipoId].comida) {
          console.log(`NOTA: Múltiples opciones para ${grupos[tipoId].nombre} el día ${comida.dia_semana}. Usando la primera.`);
        } else {
          grupos[tipoId].comida = comida;
        }
      }
    });
    
    return grupos;
  };
  
  const grupoComidas = agruparComidasPorTipo();
  
  // Función para formatear fechas en español
  const formatearFecha = (fecha) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(fecha).toLocaleDateString('es-ES', options);
    } catch (error) {
      return fecha;
    }
  };
  
  // Función para formatear el nombre del día actual
  const formatearNombreDia = (numeroDia) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias[numeroDia === 7 ? 0 : numeroDia];
  };

  // Calcular cuántos días faltan para la fecha de vigencia
  const calcularDiasRestantes = () => {
    const hoy = new Date();
    const vigencia = new Date(minuta.fecha_vigencia);
    const diferencia = Math.ceil((vigencia - hoy) / (1000 * 60 * 60 * 24));
    return diferencia > 0 ? diferencia : 0;
  };

  const diasRestantes = calcularDiasRestantes();

  // Modificamos la función para obtener el texto correcto según el día seleccionado
  const obtenerTextoDia = () => {
    const hoy = new Date();
    const diaHoy = hoy.getDay() === 0 ? 7 : hoy.getDay(); // Domingo como 7
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const diaManana = manana.getDay() === 0 ? 7 : manana.getDay();
    
    if (currentDay === diaHoy) {
      return `Comidas para hoy (${formatearNombreDia(currentDay)})`;
    } else if (currentDay === diaManana) {
      return `Comidas para mañana (${formatearNombreDia(currentDay)})`;
    } else {
      return `Comidas para ${formatearNombreDia(currentDay)}`;
    }
  };

  // Función para confirmar la revocación del plan
  const confirmarRevocacion = () => {
    Alert.alert(
      'Revocar plan alimentario',
      '¿Estás seguro que deseas eliminar este plan alimentario? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Revocar',
          style: 'destructive',
          onPress: onRevocarPlan
        }
      ]
    );
  };

  return (
    <View style={styles.minutaDetails}>
      {/* Alerta de compatibilidad si la minuta no es ideal */}
      {compatibilidadMinuta && !compatibilidadMinuta.compatible && (
        <CompatibilidadAlerta compatibilidadInfo={compatibilidadMinuta} />
      )}
      
      {/* NUEVO: Mostrar las restricciones específicas que no se cumplen */}
      {compatibilidadMinuta && compatibilidadMinuta.criteriosFallidos && 
       compatibilidadMinuta.criteriosFallidos.length > 0 && (
        <RestriccionesFallidas criteriosFallidos={compatibilidadMinuta.criteriosFallidos} />
      )}
      
      {/* Selector de días */}
      <DiaSelectorMinuta 
        currentDay={currentDay}
        onChangeDay={onChangeDay}
        fechaVigencia={minuta.fecha_vigencia}
      />
      
      <Divider style={styles.divider} />
      
      {/* Mostrar los 4 tipos de comidas en orden */}
      {tiposComida.sort((a, b) => a.id - b.id).map(tipo => {
        const grupo = grupoComidas[tipo.id];
        if (!grupo) return null;
        
        return (
          <View key={tipo.id} style={styles.mealGroup}>
            {grupo.comida ? (
              <TouchableOpacity 
                key={grupo.comida.id} 
                style={styles.mealItemCard}
                onPress={() => onVerDetalleComida({
                  id: grupo.comida.id,
                  name: grupo.comida.nombre_comida,
                  desc: grupo.comida.descripcion,
                  image: grupo.comida.imagen_url,
                  tipoComida: tipo.nombre
                })}
                activeOpacity={0.7}
              >
                <View style={styles.mealItemContent}>
                  {/* Tipo de comida como banda superior */}
                  <View style={styles.mealItemTipoTag}>
                    <Text style={styles.mealItemTipoText}>{tipo.nombre}</Text>
                  </View>
                  
                  {/* Contenido principal de la tarjeta */}
                  <View style={styles.mealItemInfoContainer}>
                    {grupo.comida.imagen_url ? (
                      <Image 
                        source={{ 
                          uri: getImageUrl(grupo.comida.imagen_url)
                        }}
                        style={styles.mealItemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.mealItemNoImage}>
                        <MaterialIcons name="restaurant" size={32} color="#ccc" />
                      </View>
                    )}
                    
                    <View style={styles.mealItemDetails}>
                      <Text style={styles.mealItemName}>{grupo.comida.nombre_comida}</Text>
                      <Text style={styles.mealItemDesc} numberOfLines={2}>{grupo.comida.descripcion}</Text>
                      <View style={styles.mealItemActionRow}>
                        <MaterialIcons name="visibility" size={16} color="#690B22" />
                        <Text style={styles.mealItemActionText}>Ver detalles</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              // No hay comida asignada para este tipo
              <View style={styles.noComidaItem}>
                <Text style={styles.noComidaText}>
                  No hay {tipo.nombre.toLowerCase()} asignado para este día
                </Text>
              </View>
            )}
          </View>
        );
      })}
      
      {/* Si no hay comidas para este día */}
      {comidas.length === 0 && (
        <View style={styles.noComidasContainer}>
          <MaterialIcons name="restaurant-menu" size={40} color="#690B22" opacity={0.6} />
          <Text style={styles.noComidasText}>
            No hay comidas asignadas para hoy. Por favor contacta con tu nutricionista.
          </Text>
        </View>
      )}
      
      {/* Botón de revocar plan - Ahora ubicado al final del componente */}
      <View style={styles.revocarButtonContainer}>
        <TouchableOpacity 
          style={styles.revocarButton}
          onPress={confirmarRevocacion}
        >
          <MaterialIcons name="delete-outline" size={18} color="#c62828" />
          <Text style={styles.revocarButtonText}>Revocar plan alimentario</Text>
        </TouchableOpacity>
        <Text style={styles.revocarInfo}>
          Al revocar el plan, podrás solicitar uno nuevo con diferentes restricciones y recomendaciones
        </Text>
      </View>
    </View>
  );
};

export default MinutaDetail;
