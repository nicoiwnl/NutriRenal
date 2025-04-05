import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#690B22',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Header Card Styles
  headerCard: {
    margin: 8,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  rutContainer: {
    backgroundColor: '#F8F0E8',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  rutLabel: {
    fontSize: 12,
    color: '#690B22',
    fontWeight: 'bold',
  },
  rutValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  nombreLabel: {
    fontSize: 14,
    color: '#690B22',
    fontWeight: 'bold',
    marginTop: 5,
  },
  nombreValue: {
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Card Styles
  card: {
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    color: '#690B22',
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: '#666666',
    fontSize: 12,
  },
  
  // Information Row Styles
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    flex: 0.4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B4D3E',
    flex: 0.5,
    textAlign: 'right',
  },
  editButton: {
    padding: 5,
    marginLeft: 5,
    flex: 0.1,
    alignItems: 'center',
  },
  autoCalcIcon: {
    padding: 5,
    marginLeft: 5,
    flex: 0.1,
    alignItems: 'center',
    opacity: 0.6,
  },
  
  // Editable field styles
  editableValueContainer: {
    flex: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  editableInput: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'right',
    minWidth: 60,
    color: '#1B4D3E',
    fontSize: 14,
  },
  unitText: {
    marginLeft: 5,
    color: '#555',
    fontSize: 14,
  },
  editActionsContainer: {
    flexDirection: 'row',
    marginLeft: 5,
  },
  editActionButton: {
    padding: 4,
    borderRadius: 4,
    marginLeft: 2,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  
  // Options styles
  optionsContainer: {
    flexDirection: 'column',
    marginRight: 10,
    flex: 1,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: '#f1f1f1',
  },
  optionButtonSelected: {
    backgroundColor: '#690B22',
  },
  optionText: {
    color: '#1B4D3E',
    fontSize: 14,
  },
  optionTextSelected: {
    color: 'white',
    fontSize: 14,
  },
  
  // Value indicator styles
  calculatedValue: {
    color: '#1B4D3E',
    fontWeight: 'bold',
  },
  placeholderValue: {
    color: '#888',
    fontStyle: 'italic',
  },
  
  // Medical conditions styles
  condicionesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  condicionBadge: {
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  condicionText: {
    color: '#0288D1',
    fontSize: 14,
  },
  
  // No data states
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    padding: 10,
  },
  noProfileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  warningIcon: {
    marginBottom: 15,
  },
  noProfileText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 20,
    lineHeight: 24,
  },
  
  // Create profile styles
  createProfileCard: {
    backgroundColor: '#F8F4E3',
    borderLeftWidth: 5,
    borderLeftColor: '#690B22',
  },
  createProfileTitle: {
    fontSize: 20,
    color: '#690B22',
    fontWeight: 'bold',
  },
  createProfileText: {
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 20,
    lineHeight: 22,
  },
  initialProfileFields: {
    marginTop: 15,
  },
  fieldHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 8,
  },
  createProfileInput: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: '#1B4D3E',
    fontSize: 16,
  },
  
  // Buttons
  scrollToCreateButton: {
    backgroundColor: '#690B22',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  scrollToCreateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  fullWidthButton: {
    alignSelf: 'center',
    width: '100%',
    marginVertical: 15,
  },
  actionButton: {
    backgroundColor: '#690B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  editCondicionesButton: {
    backgroundColor: '#690B22',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  editCondicionesButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // Condiciones selector
  selectorCondiciones: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F4E3',
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#690B22',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  condicionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 8,
  },
  condicionOptionSelected: {
    backgroundColor: '#690B22',
  },
  condicionOptionText: {
    fontSize: 16,
    color: '#1B4D3E',
  },
  condicionOptionTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  selectorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  
  // No condiciones styles
  noCondicionesContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noCondicionesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 20,
    lineHeight: 24,
  },
  
  // Caregiver styles
  caregiverHeaderCard: {
    margin: 8,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  caregiverCardTitle: {
    fontSize: 20,
    color: '#690B22',
    fontWeight: 'bold',
  },
  caregiverInstructions: {
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 20,
    lineHeight: 22,
  },
  patientLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  patientCodeInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
  linkButton: {
    backgroundColor: '#690B22',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkingErrorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 15,
  },
  linkingSuccessText: {
    color: '#4CAF50',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  linkedPatientsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  linkedPatientsContainer: {
    marginBottom: 20,
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  patientCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  patientCardInfo: {
    flex: 1,
  },
  patientCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  patientCardDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  patientCardStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  patientCardStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noLinkedPatientsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  noLinkedPatientsText: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
  },
  
  // Patient view header (for caregiver)
  patientViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    color: '#690B22',
    fontSize: 16,
    fontWeight: '500',
  },
  patientViewTitle: {
    flex: 1,
    color: '#1B4D3E',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Diagnostic button
  diagnosticButton: {
    marginTop: 20,
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  diagnosticButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Debug styles
  debugCard: {
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#FFECB3',
    borderWidth: 1,
    borderColor: '#FFB300',
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  debugHighlight: {
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  debugButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
    alignSelf: 'center',
    marginVertical: 10,
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Alimentos recientes styles - Volviendo al primer estilo
  alimentosRecientesContainer: {
    marginTop: 8,
  },
  alimentoItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 0,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  alimentoItemHeader: {
    backgroundColor: '#690B22',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  alimentoItemNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  alimentoItemContent: {
    padding: 12,
  },
  alimentoItemInfo: {
    paddingVertical: 8,
  },
  alimentoItemTime: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  alimentoItemTimeText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginLeft: 4,
  },
  alimentoItemDateText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 8,
  },
  cantidadContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginTop: 4,
  },
  cantidadIcon: {
    marginRight: 6,
  },
  cantidadText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  nutrientesTitulo: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  // Nuevo grid de nutrientes más optimizado para móvil
  nutrientesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
  },
  nutrientItem: {
    width: '48%',  // Dos columnas
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  nutrientLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  notasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFF9C4',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  notasText: {
    fontSize: 13,
    color: '#5D4037',
    marginLeft: 8,
    flex: 1,
  },
  verMasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E3D3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
  },
  verMasButtonText: {
    color: '#690B22',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 6,
  },

  // Estado vacío mejorado
  noAlimentosContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginTop: 10,
  },
  noAlimentosText: {
    fontSize: 16,
    color: '#1B4D3E', 
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  registrarButton: {
    backgroundColor: '#690B22',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  registrarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Patient code styles
  patientCodeContainer: {
    alignItems: 'center',
    padding: 15,
  },
  patientCodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: '#F1E3D3',
    borderWidth: 1,
    borderColor: '#690B22',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 15,
    width: '100%',
  },
  patientCodeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center',
    letterSpacing: 1,
  },
  patientCodeInstructions: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  copyButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  // Photo modal styles
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(105, 11, 34, 0.7)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#690B22',
    fontSize: 12,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOptionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 350,
  },
  photoOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 20,
    textAlign: 'center',
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photoOptionText: {
    fontSize: 16,
    color: '#1B4D3E',
    marginLeft: 15,
  },
  cancelOption: {
    justifyContent: 'center',
    marginTop: 10,
    borderBottomWidth: 0,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Mobile-specific styles
  mobileDialysisContainer: {
    flexDirection: 'column',
    marginBottom: 15,
  },
  mobileDialysisOption: {
    padding: 10,
    height: 44,
    justifyContent: 'center',
    marginBottom: 10,
  },
  mobileDialysisOptionText: {
    fontSize: 14,
  },
  mobileActionButtonsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(241, 227, 211, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    zIndex: 1000,
  },
  mobileActionButton: {
    padding: 8,
    width: '48%',
  },
  mobileActionButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  
  // Custom styled dialysis type container
  dialysisTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  
  // Action buttons container
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: Platform.OS === 'web' ? 0 : 10,
  },
});
