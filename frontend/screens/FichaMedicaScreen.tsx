import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Image, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider, Card } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importaciones del módulo fichaMedica
import useFichaMedica from '../modules/fichaMedica/hooks/useFichaMedica';
import styles from '../modules/fichaMedica/styles/fichaMedicaStyles';

// Componentes del módulo fichaMedica
import HeaderCard from '../modules/fichaMedica/components/HeaderCard';
import DatosPersonalesCard from '../modules/fichaMedica/components/DatosPersonalesCard';
import InformacionMedicaCard from '../modules/fichaMedica/components/InformacionMedicaCard';
import CondicionesMedicasCard from '../modules/fichaMedica/components/CondicionesMedicasCard';
import AlimentosRecientesCard from '../modules/fichaMedica/components/AlimentosRecientesCard';
import CuidadoresCard from '../modules/fichaMedica/components/CuidadoresCard';
import PhotoOptionsModal from '../modules/fichaMedica/components/PhotoOptionsModal';
import CreateProfileCard from '../modules/fichaMedica/components/CreateProfileCard';

// Helpers necesarios
import { getImageUrl } from '../utils/imageHelper';

// Constantes
const SHOW_DEBUG_UI = false; // Set to false to hide development debug panels
const formatearAltura = (altura) => {
  if (!altura) return '0.00';
  const alturaNum = parseFloat(altura);
  return alturaNum.toFixed(2);
};

export const options = {
  title: 'Ficha Médica'
};

export default function FichaMedicaScreen({ navigation, route }) {
  // Usar el hook del módulo
  const fichaMedica = useFichaMedica(navigation, route);
  
  const {
    loading,
    error,
    refreshing,
    userRole,
    pacienteData,
    editMode,
    tempValues,
    condicionesDisponibles,
    condicionesSeleccionadas,
    mostrarSelectorCondiciones,
    nuevaCondicion,
    crearCondicionMode,
    nuevasCondicionesSeleccionadas,
    linkedPatients,
    selectedPatientId,
    newPatientCode,
    linkingError,
    linkingSuccess,
    registrosAlimenticios,
    estadisticasNutricionales,
    showPhotoOptions,
    uploadingPhoto,
    photoPreview,
    unidadesMedida,
    currentPersonaId,
    onRefresh,
    cargarDatosPaciente,
    activarEdicion,
    cancelarEdicion,
    guardarEdicion,
    toggleCondicionMedica,
    guardarCondicionesMedicas,
    cancelarSeleccionCondiciones,
    setMostrarSelectorCondiciones,
    setNuevaCondicion,
    setCrearCondicionMode,
    crearNuevaCondicion,
    handleLinkPatient,
    setNewPatientCode,
    selectPatient,
    goBackToPatientList,
    getNivelNutriente,
    computeAdjustedValues,
    handleSelectImage,
    handleTakePhoto,
    showPhotoOptionsMenu,
    setShowPhotoOptions,
    setTempValues  // Asegurarnos de que setTempValues esté en la destructuración
  } = fichaMedica;

  // Estado de carga
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loaderText}>Cargando datos médicos...</Text>
        
        {SHOW_DEBUG_UI && (
          <View style={{marginTop: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8}}>
            <Text style={{fontWeight: 'bold', textAlign: 'center'}}>Información de depuración</Text>
            <Text>Rol actual: {userRole || 'No detectado'}</Text>
            <Text>ID persona actual: {currentPersonaId || 'No disponible'}</Text>
            <Text>pacienteID seleccionado: {selectedPatientId || 'Ninguno'}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.diagnosticButton, {opacity: 0.7, marginTop: 50}]}
          onPress={() => navigation.navigate('RoleDiagnostic')} 
        >
          <Text style={styles.diagnosticButtonText}>Asistencia técnica</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Estado de error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#690B22" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargarDatosPaciente}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Vista de cuidador - Lista de pacientes
  if (userRole === 'cuidador' && !selectedPatientId) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Card style={styles.caregiverHeaderCard}>
            <Card.Title 
              title="Panel de Cuidador" 
              titleStyle={styles.caregiverCardTitle}
              onLongPress={() => {
                if (!SHOW_DEBUG_UI) {
                  navigation.navigate('RoleDiagnostic');
                }
              }}
            />
            <Card.Content>
              <Text style={styles.caregiverInstructions}>
                Como cuidador, puede vincular nuevos pacientes ingresando su código y acceder a 
                la información médica de sus pacientes vinculados.
              </Text>

              <View style={styles.patientLinkContainer}>
                <TextInput
                  style={styles.patientCodeInput}
                  placeholder="Ingrese código de paciente"
                  value={newPatientCode}
                  onChangeText={setNewPatientCode}
                />
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={handleLinkPatient}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.linkButtonText}>Vincular</Text>
                  )}
                </TouchableOpacity>
              </View>

              {linkingError ? (
                <Text style={styles.linkingErrorText}>{linkingError}</Text>
              ) : null}
              
              {linkingSuccess ? (
                <Text style={styles.linkingSuccessText}>{linkingSuccess}</Text>
              ) : null}
              
              <Text style={styles.linkedPatientsTitle}>Mis Pacientes</Text>
              {linkedPatients.length > 0 ? (
                <View style={styles.linkedPatientsContainer}>
                  {linkedPatients.map((patient, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.patientCard}
                      onPress={() => selectPatient(patient.paciente_id)}
                    >
                      <Image 
                        source={{ 
                          uri: getImageUrl(
                            patient.foto_perfil,
                            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                          )
                        }}
                        style={styles.patientCardImage}
                        resizeMode="cover"
                      />
                      <View style={styles.patientCardInfo}>
                        <Text style={styles.patientCardName}>{patient.nombre}</Text>
                        <Text style={styles.patientCardDetail}>Edad: {patient.edad} años</Text>
                        <Text style={styles.patientCardDetail}>Género: {patient.genero || 'No especificado'}</Text>
                        <View style={[
                          styles.patientCardStatusBadge,
                          {backgroundColor: patient.activo ? '#4CAF50' : '#F44336'}
                        ]}>
                          <Text style={styles.patientCardStatusText}>
                            {patient.activo ? 'Activo' : 'Inactivo'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noLinkedPatientsContainer}>
                  <MaterialIcons name="people" size={48} color="#690B22" />
                  <Text style={styles.noLinkedPatientsText}>
                    No tiene pacientes vinculados. Vincule pacientes usando sus códigos de paciente.
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Vista de cuidador - Ver paciente específico
  if (userRole === 'cuidador' && selectedPatientId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.patientViewHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={goBackToPatientList}
          >
            <MaterialIcons name="arrow-back" size={24} color="#690B22" />
            <Text style={styles.backButtonText}>Volver a Lista</Text>
          </TouchableOpacity>
          <Text style={styles.patientViewTitle}>Ficha de Paciente</Text>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {pacienteData && (
            <>
              <HeaderCard 
                pacienteData={pacienteData} 
                userRole={userRole} 
                selectedPatientId={selectedPatientId}
                showPhotoOptions={showPhotoOptions}
                photoPreview={photoPreview}
                uploadingPhoto={uploadingPhoto}
                showPhotoOptionsMenu={showPhotoOptionsMenu}
              />

              <DatosPersonalesCard pacienteData={pacienteData} />

              <InformacionMedicaCard 
                pacienteData={pacienteData}
                editMode={editMode}
                tempValues={tempValues}
                activarEdicion={activarEdicion}
                cancelarEdicion={cancelarEdicion}
                guardarEdicion={guardarEdicion}
                setTempValues={setTempValues}
                formatearAltura={formatearAltura}
              />

              <CondicionesMedicasCard 
                pacienteData={pacienteData}
                mostrarSelectorCondiciones={mostrarSelectorCondiciones}
                condicionesDisponibles={condicionesDisponibles}
                nuevasCondicionesSeleccionadas={nuevasCondicionesSeleccionadas}
                toggleCondicionMedica={toggleCondicionMedica}
                guardarCondicionesMedicas={guardarCondicionesMedicas}
                cancelarSeleccionCondiciones={cancelarSeleccionCondiciones}
                setMostrarSelectorCondiciones={setMostrarSelectorCondiciones}
              />

              <AlimentosRecientesCard 
                registrosAlimenticios={registrosAlimenticios}
                navigation={navigation}
                getNivelNutriente={getNivelNutriente}
                computeAdjustedValues={computeAdjustedValues}
                unidadesMedida={unidadesMedida}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Vista predeterminada (para pacientes o cuidadores viendo un paciente)
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <HeaderCard 
            pacienteData={pacienteData} 
            userRole={userRole} 
            selectedPatientId={selectedPatientId}
            showPhotoOptions={showPhotoOptions}
            photoPreview={photoPreview}
            uploadingPhoto={uploadingPhoto}
            showPhotoOptionsMenu={showPhotoOptionsMenu}
          />

          <DatosPersonalesCard pacienteData={pacienteData} />

          {!pacienteData?.perfil_medico && (
            <CreateProfileCard 
              tempValues={tempValues} 
              setTempValues={setTempValues} 
              guardarEdicion={guardarEdicion} 
            />
          )}

          <InformacionMedicaCard 
            pacienteData={pacienteData}
            editMode={editMode}
            tempValues={tempValues}
            activarEdicion={activarEdicion}
            cancelarEdicion={cancelarEdicion}
            guardarEdicion={guardarEdicion}
            setTempValues={setTempValues}
            formatearAltura={formatearAltura}
          />

          <CondicionesMedicasCard 
            pacienteData={pacienteData}
            mostrarSelectorCondiciones={mostrarSelectorCondiciones}
            condicionesDisponibles={condicionesDisponibles}
            nuevasCondicionesSeleccionadas={nuevasCondicionesSeleccionadas}
            toggleCondicionMedica={toggleCondicionMedica}
            guardarCondicionesMedicas={guardarCondicionesMedicas}
            cancelarSeleccionCondiciones={cancelarSeleccionCondiciones}
            setMostrarSelectorCondiciones={setMostrarSelectorCondiciones}
          />

          <AlimentosRecientesCard 
            registrosAlimenticios={registrosAlimenticios}
            navigation={navigation}
            getNivelNutriente={getNivelNutriente}
            computeAdjustedValues={computeAdjustedValues}
            unidadesMedida={unidadesMedida}
          />

          {userRole === 'paciente' && (
            <CuidadoresCard currentPersonaId={currentPersonaId} />
          )}
        </ScrollView>
        
        <PhotoOptionsModal 
          visible={showPhotoOptions}
          onDismiss={() => setShowPhotoOptions(false)}
          onTakePhoto={handleTakePhoto}
          onSelectImage={handleSelectImage}
        />
      </SafeAreaView>
    </Provider>
  );
}