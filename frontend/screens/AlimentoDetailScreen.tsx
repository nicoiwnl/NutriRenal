import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function AlimentoDetailScreen({ route }: any) {
  const { alimento } = route.params;
  const [showDetails, setShowDetails] = useState(false);
  const [modalSemaforoVisible, setModalSemaforoVisible] = useState(false);
  const [modalValoresVisible, setModalValoresVisible] = useState(false);

  const getSemaphoreColor = (nutrient: string, value: number): string => {
    if (nutrient === 'potasio') {
      if (value > 300) return 'red';
      else if (value >= 151) return 'yellow';
      else return 'green';
    } else if (nutrient === 'sodio') {
      if (value > 600) return 'red';
      else if (value >= 500) return 'yellow';
      else return 'green';
    } else if (nutrient === 'fosforo') {
      if (value > 300) return 'red';
      else if (value >= 91) return 'yellow';
      else return 'green';
    }
    return 'grey';
  };

  const potasio = Number(alimento.potasio || 0);
  const sodio = Number(alimento.sodio || 0);
  const fosforo = Number(alimento.fosforo || 0);

  const friendlyNames: { [key: string]: string } = {
    energia: 'Energía',
    humedad: 'Humedad',
    cenizas: 'Cenizas',
    proteinas: 'Proteínas',
    hidratos_carbono: 'Hidratos de Carbono',
    azucares_totales: 'Azúcares Totales',
    fibra_dietetica: 'Fibra Dietética',
    lipidos_totales: 'Lípidos Totales',
    acidos_grasos_saturados: 'Ácidos Grasos Saturados',
    acidos_grasos_monoinsaturados: 'Ácidos Grasos Monoinsaturados',
    acidos_grasos_poliinsaturados: 'Ácidos Grasos Poliinsaturados',
    acidos_grasos_trans: 'Ácidos Grasos Trans',
    colesterol: 'Colesterol',
    vitamina_A: 'Vitamina A',
    vitamina_C: 'Vitamina C',
    vitamina_D: 'Vitamina D',
    vitamina_E: 'Vitamina E',
    vitamina_K: 'Vitamina K',
    vitamina_B1: 'Vitamina B1',
    vitamina_B2: 'Vitamina B2',
    niacina: 'Niacina',
    vitamina_B6: 'Vitamina B6',
    acido_pantotenico: 'Ácido Pantoténico',
    vitamina_B12: 'Vitamina B12',
    folatos: 'Folatos',
    calcio: 'Calcio',
    magnesio: 'Magnesio',
    hierro: 'Hierro',
    zinc: 'Zinc',
    cobre: 'Cobre',
    selenio: 'Selenio',
    alcohol: 'Alcohol'
  };

  const detailEntries = Object.entries(alimento).filter(
    ([key]) => !['id', 'activo', 'categoria', 'nombre', 'potasio', 'sodio', 'fosforo'].includes(key)
  );

  const semaforoText = `En función del color sabremos si es un alimento seguro o no, a veces se puede mejorar la seguridad con una manipulación específica.

🔴 Alimento peligroso en las cantidades seleccionadas. No recomendable si no se puede reducir el contenido (ver sección de consejos).

🟡 Alimento que conlleva un cierto riesgo en las cantidades seleccionadas. Vea si se puede reducir el contenido (ver sección de consejos).

🟢 Alimento seguro en las cantidades seleccionadas.`;

  const valoresTexto = `Los valores que NutriRenal muestra de referencia en el semáforo renal son:

Potasio:
🔴 > 300
🟡 151 - 299
🟢 0 - 150
La cantidad máxima diaria recomendada de ingesta de potasio en insuficiencia renal es 2000 mg.

Sodio:
🔴 > 600
🟢 < 600
La cantidad máxima diaria recomendada de ingesta de sodio en hipertensión arterial es 2000 mg.

Fósforo:
🔴 > 300
🟡 91 - 299
🟢 0 - 90
La cantidad máxima diaria recomendada de ingesta de fósforo en insuficiencia renal es 1000 mg.`;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{alimento.nombre}</Text>
      <Text style={styles.infoText}>Valores por 100 ml/gr</Text>
      <View style={styles.semaphoreContainer}>
        <View style={styles.semaphoreItem}>
          <Text style={styles.label}>Potasio</Text>
          <View style={[styles.circle, { backgroundColor: getSemaphoreColor('potasio', potasio) }]} />
          <Text style={styles.value}>{potasio}</Text>
        </View>
        <View style={styles.semaphoreItem}>
          <Text style={styles.label}>Sodio</Text>
          <View style={[styles.circle, { backgroundColor: getSemaphoreColor('sodio', sodio) }]} />
          <Text style={styles.value}>{sodio}</Text>
        </View>
        <View style={styles.semaphoreItem}>
          <Text style={styles.label}>Fósforo</Text>
          <View style={[styles.circle, { backgroundColor: getSemaphoreColor('fosforo', fosforo) }]} />
          <Text style={styles.value}>{fosforo}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.detailButton} onPress={() => setShowDetails(prev => !prev)}>
        <Text style={styles.detailButtonText}>
          {showDetails ? 'Ocultar información nutricional completa' : 'Ver información nutricional completa'}
        </Text>
      </TouchableOpacity>
      {showDetails && (
        <ScrollView style={styles.detailsContainer}>
          {detailEntries.map(([key, value]) => (
            <View key={key} style={styles.detailRow}>
              <Text style={styles.detailKey}>{friendlyNames[key] || key}:</Text>
              <Text style={styles.detailValue}>{value !== null ? String(value) : 'N/A'}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={{ flex: 1, padding: 20 }}>
        <TouchableOpacity onPress={() => setModalSemaforoVisible(true)} style={styles.infoButton}>
          <MaterialIcons name="info" size={24} color="black" />
          <Text style={styles.infoButtonText}>Más información sobre el semáforo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalValoresVisible(true)} style={styles.infoButton}>
          <MaterialIcons name="info" size={24} color="black" />
          <Text style={styles.infoButtonText}>Valores de referencia</Text>
        </TouchableOpacity>
        <Modal visible={modalSemaforoVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>SEMAFORO RENAL</Text>
              {Platform.OS === 'web' ? (
                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalText}>{semaforoText}</Text>
                </ScrollView>
              ) : (
                <View style={styles.modalScroll}>
                  <Text style={styles.modalText}>{semaforoText}</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => setModalSemaforoVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={modalValoresVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>VALORES DE REFERENCIA</Text>
              {Platform.OS === 'web' ? (
                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalText}>{valoresTexto}</Text>
                </ScrollView>
              ) : (
                <View style={styles.modalScroll}>
                  <Text style={styles.modalText}>{valoresTexto}</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => setModalValoresVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
    fontSize: 14,
    fontStyle: 'italic',
  },
  semaphoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  semaphoreItem: {
    alignItems: 'center',
  },
  circle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginVertical: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    color: '#555',
  },
  detailButton: {
    backgroundColor: '#690B22',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  detailButtonText: {
    color: '#F1E3D3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailKey: {
    fontWeight: 'bold',
    color: '#333',
  },
  detailValue: {
    color: '#555',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: 'black',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalScroll: {
    marginVertical: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  modalCloseButton: {
    marginTop: 20,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#690B22',
    borderRadius: 6,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
