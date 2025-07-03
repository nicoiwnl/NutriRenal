import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Importar componentes y hooks del módulo
import MinutaSelector from '../modules/comidas/components/MinutaSelector';
import MinutaDetail from '../modules/comidas/components/MinutaDetail';
import NoDataMinuta from '../modules/comidas/components/NoDataMinuta';
import ComidaDetalleModal from '../modules/comidas/components/ComidaDetalleModal';
import NoMinutaCard from '../modules/comidas/components/NoMinutaCard';
import RestriccionesForm from '../modules/comidas/components/RestriccionesForm';
import useMinuta from '../modules/comidas/hooks/useMinuta';
import styles from '../modules/comidas/styles/minutaStyles';

export default function MinutaScreen({ navigation }) {
  // Usar el hook personalizado
  const {
    loading,
    minutas,
    selectedMinuta,
    error,
    tienePerfil,
    pacienteData,
    currentDay,
    comidas,
    tiposComida,
    mostrarSolicitud,
    restricciones,
    comidaSeleccionada,
    mostrarDetalleComida,
    compatibilidadMinuta, // Añadimos esta propiedad
    handleSelectMinuta,
    handleChangeDay,
    handleVerDetalleComida,
    handleCerrarDetalleComida,
    handleSolicitarMinuta,
    handleCancelarSolicitud,
    handleCambiarRestriccion,
    handleConfirmarSolicitud,
    handleRevocarMinuta,
    refreshMinutas
  } = useMinuta();

  // Añadir efecto para refrescar minutas al montar el componente y cuando se enfoca la pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('📱 MinutaScreen enfocada - refrescando datos');
      refreshMinutas();
    });

    // Carga inicial
    refreshMinutas();
    
    // Limpieza al desmontar
    return unsubscribe;
  }, [navigation]);
  
  // Error handling
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'Entendido', onPress: refreshMinutas }]);
    }
  }, [error]);

  // Pantalla de carga mejorada
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8E8D8" />
        <View style={styles.loadingAnimation}>
          <MaterialIcons name="restaurant" size={55} color="#690B22" />
          <ActivityIndicator size="large" color="#690B22" style={{marginTop: 20}} />
        </View>
        <Text style={styles.loadingText}>Preparando su plan alimentario...</Text>
        <Text style={styles.loadingSubtext}>Esto tomará solo un momento</Text>
      </View>
    );
  }

  // Pantalla de perfil médico requerido mejorada
  if (!tienePerfil) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8E8D8" />
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.screenTitle}>Tu Plan Alimentario</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <View style={styles.noPerfilCard}>
            <View style={styles.noPerfilIconContainer}>
              <MaterialIcons name="medical-services" size={45} color="#690B22" />
            </View>
            <Text style={styles.noPerfilTitle}>
              Información médica necesaria
            </Text>
            <Text style={styles.noPerfilDescription}>
              Para crear tu plan alimentario personalizado, necesitamos algunos datos importantes sobre tu salud. Esto nos ayudará a ofrecerte recomendaciones adecuadas para tu situación particular.
            </Text>
            <TouchableOpacity 
              style={styles.noPerfilButton}
              onPress={() => navigation.navigate('FichaMedica')}
            >
              <MaterialIcons name="article" size={20} color="#fff" />
              <Text style={styles.noPerfilButtonText}>Completar mi Ficha Médica</Text>
            </TouchableOpacity>
            <Text style={styles.noPerfilTip}>
              Esto tomará menos de 5 minutos
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Verificación adicional: no hay minutas ni una minuta seleccionada
  const tieneMinutaAsignada = minutas.length > 0 && selectedMinuta !== null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8E8D8" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Plan Alimentario</Text>
        <Text style={styles.screenSubtitle}>Recomendaciones para tu alimentación</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {!tieneMinutaAsignada ? (
          <NoMinutaCard 
            pacienteData={pacienteData} 
            onSolicitarMinuta={handleSolicitarMinuta} 
          />
        ) : (
          <View style={styles.minutaContainer}>
            {/* Selector de minuta si hay más de una */}
            {minutas.length > 1 && (
              <MinutaSelector 
                minutas={minutas}
                selectedMinuta={selectedMinuta}
                onSelect={handleSelectMinuta}
              />
            )}
            
            {/* Info banner del plan activo - ahora con la info de vigencia */}
            {selectedMinuta && (
              <View style={styles.periodoVigenciaContainer}>
                <MaterialIcons name="event-available" size={22} color="#690B22" />
                <View style={styles.periodoVigenciaTextos}>
                  <Text style={styles.periodoVigenciaTitle}>
                    Plan alimentario vigente
                  </Text>
                  <Text style={styles.vigenciaText}>
                    {`Finaliza el ${new Date(selectedMinuta.fecha_vigencia).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}`}
                    {/* Calcular días restantes */}
                    {(() => {
                      const hoy = new Date();
                      const vigencia = new Date(selectedMinuta.fecha_vigencia);
                      const diferencia = Math.ceil((vigencia - hoy) / (1000 * 60 * 60 * 24));
                      const diasRestantes = diferencia > 0 ? diferencia : 0;
                      return (
                        <Text style={styles.diasRestantesText}>
                          {` (${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} restantes)`}
                        </Text>
                      );
                    })()}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Detalles de la minuta seleccionada */}
            {selectedMinuta && (
              <MinutaDetail 
                minuta={selectedMinuta}
                comidas={comidas}
                tiposComida={tiposComida}
                currentDay={currentDay}
                onChangeDay={handleChangeDay}
                onVerDetalleComida={handleVerDetalleComida}
                onRevocarPlan={handleRevocarMinuta}
                compatibilidadMinuta={compatibilidadMinuta} // Pasar la info de compatibilidad
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal para mostrar detalles de una comida */}
      <ComidaDetalleModal 
        visible={mostrarDetalleComida}
        comida={comidaSeleccionada}
        onClose={handleCerrarDetalleComida}
      />

      {/* Modal para solicitar minuta con restricciones */}
      <RestriccionesForm
        visible={mostrarSolicitud}
        restricciones={restricciones}
        onChangeRestriccion={handleCambiarRestriccion}
        onConfirmar={handleConfirmarSolicitud}
        onCancelar={handleCancelarSolicitud}
        loading={loading}
      />
    </SafeAreaView>
  );
}
