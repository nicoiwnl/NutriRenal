import React from 'react';
import { View, Text, FlatList, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Componentes del módulo de registros
import LoadingView from '../modules/registros/components/LoadingView';
import CalendarHeader from '../modules/registros/components/CalendarHeader';
import WeekCalendar from '../modules/registros/components/WeekCalendar';
import MonthCalendar from '../modules/registros/components/MonthCalendar';
import ResumenDiario from '../modules/registros/components/ResumenDiario';
import RegistroItem from '../modules/registros/components/RegistroItem';
import EmptyRegistrosView from '../modules/registros/components/EmptyRegistrosView';
import PatientSelector from '../modules/registros/components/PatientSelector';
import NoLinkedPatientsView from '../modules/registros/components/NoLinkedPatientsView';
import RegisterButton from '../modules/registros/components/RegisterButton';
import useRegistros from '../modules/registros/hooks/useRegistros';
import styles from '../modules/registros/styles/registrosStyles';

export default function MisRegistrosScreen({ navigation }) {
  const {
    loading,
    registros,
    selectedDate,
    setSelectedDate,
    markedDates,
    calendarView,
    userData,
    selectedPatientId,
    setSelectedPatientId,
    linkedPatients,
    weekDates,
    registrosFiltrados,
    totalesDiarios,
    formatDateInSpanish,
    formatDate,
    getNutrientColor,
    getNutrientDailyColor,
    toggleCalendarView,
    onRefresh,
    navigateToAlimentos, // This is already included in the hook
    unidadesMedida
  } = useRegistros(navigation);

  if (loading) {
    return <LoadingView />;
  }

  if (userData?.role === 'cuidador' && linkedPatients.length === 0) {
    return <NoLinkedPatientsView onBackPress={() => navigation.navigate('Home')} />;
  }

  if (userData?.role === 'cuidador' && !selectedPatientId) {
    return (
      <PatientSelector
        linkedPatients={linkedPatients}
        onSelectPatient={setSelectedPatientId}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={selectedDate ? registrosFiltrados : []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RegistroItem
            item={item}
            formatDate={formatDate}
            getNutrientColor={getNutrientColor}
            userData={userData}
            unidadesMedida={unidadesMedida} // Pasar las unidades reales en lugar de un array vacío
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.calendarSection}>
              <CalendarHeader
                calendarView={calendarView}
                onToggleCalendarView={toggleCalendarView}
              />
              
              {calendarView === 'week' ? (
                <WeekCalendar
                  weekDates={weekDates}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  markedDates={markedDates}
                />
              ) : (
                <MonthCalendar
                  markedDates={markedDates}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              )}
            </View>
            
            {selectedDate && (
              <ResumenDiario
                selectedDate={selectedDate}
                registrosFiltrados={registrosFiltrados}
                totalesDiarios={totalesDiarios}
                formatDateInSpanish={formatDateInSpanish}
                getNutrientDailyColor={getNutrientDailyColor}
              />
            )}
            
            {selectedDate && registrosFiltrados.length > 0 && (
              <View style={styles.registrosHeader}>
                <Text style={styles.registrosTitle}>Alimentos consumidos</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          selectedDate ? (
            <EmptyRegistrosView onExplorarAlimentos={navigateToAlimentos} />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.contentContainer,
          registrosFiltrados.length === 0 && styles.emptyListContent,
          Platform.OS === 'web' && styles.webGridContainer
        ]}
      />
      
      <RegisterButton 
        onPress={() => {
          // Usar la navegación reset que es más poderosa y garantiza redireccionar
          navigation.reset({
            index: 0,
            routes: [
              { 
                name: 'Home',
                params: { screen: 'Alimentos' }
              }
            ]
          });
        }} 
      />
    </SafeAreaView>
  );
}
