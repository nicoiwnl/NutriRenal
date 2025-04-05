import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  webGridContainer: {
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      maxWidth: 1200,
      marginHorizontal: 'auto',
    }),
  },
  calendarSection: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
      },
    }),
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  calendarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  calendarToggleText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#690B22',
    fontWeight: '500',
  },
  weekCalendarContainer: {
    padding: 10,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedWeekDay: {
    backgroundColor: '#690B22',
  },
  todayWeekDay: {
    backgroundColor: 'rgba(224, 122, 95, 0.1)',
    borderWidth: 1,
    borderColor: '#E07A5F',
  },
  weekDayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  selectedWeekDayText: {
    color: '#FFFFFF',
  },
  todayWeekDayText: {
    color: '#E07A5F',
  },
  dotMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#690B22',
    marginTop: 3,
  },
  selectedDotMarker: {
    backgroundColor: '#FFFFFF',
  },
  monthCalendarContainer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E8D8',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  resumenCard: {
    margin: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0,0,0,0.15)',
      },
    }),
  },
  resumenContent: {
    padding: 10,
  },
  resumenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumenTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  resumenSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  resumenSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    marginLeft: 8,
    padding: 4,
  },
  resumenStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    height: 25,
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  rangeText: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  warningIcon: {
    marginTop: 2,
  },
  dailyWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  dailyWarningText: {
    fontSize: 12,
    color: '#D32F2F',
    marginLeft: 6,
    flex: 1,
  },
  registroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    marginHorizontal: Platform.OS === 'web' ? undefined : 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  pacienteInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F0E8',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pacienteInfoContainerMobile: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  pacienteImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  pacienteDetails: {
    flex: 1,
  },
  pacienteNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  pacienteRut: {
    fontSize: 12,
    color: '#666',
  },
  alimentoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  unidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  unidadText: {
    fontSize: 14,
    color: '#690B22',
    fontWeight: '500',
    marginLeft: 6,
  },
  alimentoInfo: {
    marginVertical: 4,
  },
  alimentoDatos: {
    backgroundColor: '#fafafa',
    padding: 8,
    borderRadius: 6,
  },
  nutrientGrid: {
    marginTop: 6,
    marginBottom: 4,
  },
  nutrientGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  nutrientGridLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: 'bold',
    marginLeft: 6,
    width: 70,
  },
  nutrientGridValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontWeight: '500',
  },
  nutrientIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  fechaConsumo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  notasTexto: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  instructionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'center',
    marginTop: 10,
  },
  refreshButton: {
    backgroundColor: '#690B22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 10,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  registrosHeader: {
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  registrosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  registrarConsumoButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 15,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: '90%',
    maxWidth: 500,
  },
  registrarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registrarConsumoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footerContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  noLinkedPatientsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 3px 8px rgba(0,0,0,0.12)',
      },
    }),
  },
  noLinkedPatientsText: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
  linkedPatientsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 20,
    textAlign: 'center',
  },
  linkedPatientsContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
      },
    }),
  },
  patientCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  simpleCardInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  simpleCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  simpleCardDetail: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 3,
  },
});
