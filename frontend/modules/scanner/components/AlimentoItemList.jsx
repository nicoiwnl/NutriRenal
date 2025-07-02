import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AlimentoItemList = ({ 
  alimentos, 
  results, 
  seleccionesEspecificas, 
  foodsWithUnits,
  onSelectAlimento,
  onRegistrarConsumo,
  alimentosRegistrados = {}, // Nuevo prop para alimentos ya registrados
  alimentosActualizados = [], // NUEVO: Inicialización por defecto para evitar error
  isReadOnly = false
}) => {
  if (!alimentos || alimentos.length === 0) {
    return (
      <View style={styles.noResultsContainer}>
        <MaterialIcons name="search-off" size={40} color="#999" />
        <Text style={styles.noResultsText}>
          No se pudieron identificar alimentos en la imagen
        </Text>
      </View>
    );
  }

  // Función helper para formatear texto de unidades
  const formatUnidadTexto = (unidadTexto) => {
    if (!unidadTexto) return '';
    
    // Si el texto ya está formateado correctamente, devolverlo
    if (typeof unidadTexto === 'string') {
      // Buscar patrones como "1.00 tazas" y convertir a "1 taza"
      const match = unidadTexto.match(/^(\d+\.?\d*)\s+(.+)$/);
      if (match) {
        const cantidad = parseFloat(match[1]);
        const unidad = match[2];
        
        // Formatear cantidad sin decimales innecesarios
        const cantidadFormateada = cantidad % 1 === 0 ? cantidad.toString() : cantidad.toFixed(2).replace(/\.?0+$/, '');
        
        // Singularizar/pluralizar unidad si es necesario
        let unidadFormateada = unidad;
        if (cantidad === 1 && unidad.endsWith('s') && !['vasos', 'platos'].includes(unidad.toLowerCase())) {
          unidadFormateada = unidad.slice(0, -1); // Remover 's' final para singular
        }
        
        return `${cantidadFormateada} ${unidadFormateada}`;
      }
    }
    
    return unidadTexto;
  };

  return (
    <View style={styles.container}>
      {/* Instructivo para una mejor UX */}
      {alimentos.length > 0 && !isReadOnly && (
        <View style={styles.instructionBanner}>
          <MaterialIcons name="touch-app" size={22} color="#1B4D3E" />
          <Text style={styles.instructionText}>
            Toca cada alimento para seleccionar la versión correcta y obtener información nutricional precisa
          </Text>
        </View>
      )}
      
      {/* MODIFICADO: Reemplazar FlatList con View para evitar nesting de VirtualizedLists */}
      <View>
        {alimentos.map((item, index) => {
          // Verifica si hay una selección específica para este item
          const nombreEspecifico = seleccionesEspecificas[item] || item;
          const unidadTexto = foodsWithUnits[nombreEspecifico];
          const isUpdated = seleccionesEspecificas[item] && seleccionesEspecificas[item] !== item;
          
          // Buscar si el alimento está registrado
          let isRegistered = false;
          
          // Intentar encontrar el ID del alimento en las selecciones específicas
          if (isUpdated && Array.isArray(alimentosActualizados)) {
            const alimentoObj = alimentosActualizados.find(a => 
              a?.nombre === nombreEspecifico || 
              a?.info?.nombre === nombreEspecifico
            );
            
            if (alimentoObj) {
              const alimentoId = alimentoObj.id || alimentoObj.info?.id;
              if (alimentoId && alimentosRegistrados) {
                isRegistered = alimentosRegistrados[alimentoId] === true;
              }
            }
          }
          
          return (
            <TouchableOpacity
              key={`alimento-${index}`}
              style={[
                styles.alimentoItem,
                isUpdated ? styles.alimentoItemUpdated : {}
              ]}
              onPress={() => onSelectAlimento(item)}
              disabled={isReadOnly}
            >
              <View style={styles.alimentoContent}>
                <View style={[
                  styles.iconContainer,
                  isUpdated ? styles.iconContainerUpdated : {}
                ]}>
                  <MaterialIcons 
                    name={isUpdated ? "check-circle" : "restaurant"} 
                    size={20} 
                    color={isUpdated ? "#FFFFFF" : "#690B22"} 
                  />
                </View>
                
                <View style={styles.alimentoTextContainer}>
                  <Text style={styles.alimentoNombre}>
                    {nombreEspecifico}
                    {unidadTexto ? ` (${formatUnidadTexto(unidadTexto)})` : ''}
                  </Text>
                  
                  {/* Si hay una selección específica diferente, muestra el término original detectado */}
                  {nombreEspecifico !== item && (
                    <Text style={styles.detectedAs}>
                      Detectado como: <Text style={styles.detectedTerm}>{item}</Text>
                    </Text>
                  )}
                  
                  {/* Show "Actualizado" cuando la comida es actualizada */}
                  {isUpdated && (
                    <View style={styles.updatedBadge}>
                      <Text style={styles.updatedBadgeText}>Actualizado</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.actionContainer}>
                {/* Mostrar botón de edición para todos los alimentos cuando no es de solo lectura */}
                {!isReadOnly && (
                  <MaterialIcons name="edit" size={24} color="#690B22" style={styles.actionIcon} />
                )}
                
                {/* Mostrar botón de registro SOLO para alimentos actualizados y no registrados previamente */}
                {!isReadOnly && isUpdated && (
                  isRegistered ? (
                    // Si ya está registrado, mostrar un icono de verificación
                    <View style={styles.registeredContainer}>
                      <MaterialIcons name="check-circle" size={24} color="#4CAF50" style={styles.actionIcon} />
                      <Text style={styles.registeredText}>Registrado</Text>
                    </View>
                  ) : (
                    // Si no está registrado, mostrar botón para registrar
                    <TouchableOpacity
                      onPress={() => onRegistrarConsumo && onRegistrarConsumo(nombreEspecifico, unidadTexto)}
                    >
                      <MaterialIcons 
                        name="playlist-add" 
                        size={24} 
                        color="#4CAF50" 
                        style={styles.actionIcon} 
                      />
                    </TouchableOpacity>
                  )
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  alimentoItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  alimentoItemUpdated: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F8FFF8', // Añadir un fondo ligeramente verde para mayor visibilidad
  },
  alimentoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1E3D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerUpdated: {
    backgroundColor: '#4CAF50',
  },
  alimentoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  alimentoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  detectedAs: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detectedTerm: {
    fontStyle: 'italic',
    color: '#999',
  },
  updatedBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  updatedBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 10,
  },
  noResultsContainer: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#1B4D3E',
    marginLeft: 8,
    lineHeight: 18,
  },
  // Estilos para el indicador "Registrado"
  registeredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registeredText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default AlimentoItemList;
