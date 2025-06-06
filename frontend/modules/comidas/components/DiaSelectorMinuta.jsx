import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/minutaStyles';

const DiaSelectorMinuta = ({ currentDay, onChangeDay, fechaVigencia }) => {
  const scrollViewRef = useRef(null);

  // Función para generar un array de días desde hoy hasta la fecha de vigencia
  const generarDiasDisponibles = () => {
    const hoy = new Date();
    const fechaFin = fechaVigencia ? new Date(fechaVigencia) : new Date(hoy);
    fechaFin.setHours(23, 59, 59, 999); // Final del día de vigencia
    
    // Asegurar que si la fecha de vigencia es anterior a hoy, al menos muestre el día actual
    if (fechaFin < hoy) {
      fechaFin.setDate(hoy.getDate());
    }

    const diasDisponibles = [];
    const diasSemanaCompletos = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Clonar la fecha para no modificar la original
    let fechaActual = new Date(hoy);
    
    // Agregar días hasta la fecha de vigencia (o hasta 7 días como máximo)
    while (fechaActual <= fechaFin && diasDisponibles.length < 7) {
      const diaSemana = fechaActual.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const diaSemanaAPI = diaSemana === 0 ? 7 : diaSemana; // Convertir a formato API (1-7)
      
      // Determinar etiqueta para el día
      let etiqueta;
      if (diasDisponibles.length === 0) {
        etiqueta = 'Hoy';
      } else if (diasDisponibles.length === 1) {
        etiqueta = 'Mañana';
      } else {
        etiqueta = `${fechaActual.getDate()} ${meses[fechaActual.getMonth()]}`;
      }
      
      diasDisponibles.push({
        numero: diaSemanaAPI,
        fecha: new Date(fechaActual),
        nombre: diasSemanaCompletos[diaSemana],
        etiqueta: etiqueta,
        esHoy: diasDisponibles.length === 0
      });
      
      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    return diasDisponibles;
  };
  
  const diasDisponibles = generarDiasDisponibles();

  // Centrar el día seleccionado cuando cambie
  useEffect(() => {
    if (scrollViewRef.current) {
      // Encontrar la posición del día seleccionado
      const selectedIndex = diasDisponibles.findIndex(dia => dia.numero === currentDay);
      if (selectedIndex !== -1) {
        const itemWidth = 85; // Aproximadamente el ancho de cada botón
        const scrollTo = Math.max(0, selectedIndex * itemWidth - 40);
        
        // Scroll a la posición - Añadir verificación adicional dentro del timeout
        const timer = setTimeout(() => {
          if (scrollViewRef.current) { // Verificación adicional de nulo aquí
            scrollViewRef.current.scrollTo({ x: scrollTo, animated: true });
          }
        }, 100);

        // Limpiar el timeout si el componente se desmonta
        return () => clearTimeout(timer);
      }
    }
  }, [currentDay]);

  return (
    <View style={styles.diaSelectorContainer}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.diasScrollView}
      >
        {diasDisponibles.map((dia) => {
          const isSelected = currentDay === dia.numero;
          
          return (
            <TouchableOpacity
              key={dia.fecha.toISOString()}
              style={[
                styles.diaButton,
                dia.esHoy && styles.diaButtonHoy,
                isSelected && styles.diaButtonSelected,
              ]}
              onPress={() => onChangeDay(dia.numero)}
            >
              <Text style={[
                styles.diaButtonText,
                isSelected && styles.diaButtonTextSelected
              ]}>
                {dia.nombre}
              </Text>
              <Text style={[
                styles.diaButtonSubtext,
                isSelected && styles.diaButtonTextSelected
              ]}>
                {dia.etiqueta}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default DiaSelectorMinuta;
