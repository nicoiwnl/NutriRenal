import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  // Estilos mejorados para MinutaScreen principal
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: '#F8E8D8',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#690B22',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  dividerLine: {
    height: 3,
    width: 60,
    backgroundColor: '#690B22',
    marginTop: 8,
    marginBottom: 5,
    borderRadius: 2,
  },
  minutaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activePlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
  },
  activePlanText: {
    color: '#155724',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // Estilo mejorado de tarjeta para No Profile
  noPerfilCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  noPerfilIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FCF1F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noPerfilTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
    textAlign: 'center',
  },
  noPerfilDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  noPerfilButton: {
    backgroundColor: '#690B22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
  },
  noPerfilButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  noPerfilTip: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  
  // Pantalla de carga mejorada
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E8D8',
    padding: 20,
  },
  loadingAnimation: {
    alignItems: 'center',
    marginBottom: 25,
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#690B22',
    fontStyle: 'italic',
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
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  minutaSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 10,
  },
  minutaTab: {
    backgroundColor: '#F1E3D3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedMinutaTab: {
    backgroundColor: '#E07A5F',
  },
  minutaTabText: {
    color: '#1B4D3E',
  },
  selectedMinutaTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  minutaDetails: {
    marginTop: 10,
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 20,       // Aumentado para más espacio
    marginTop: 10,          // Añadido para más espacio arriba
    paddingVertical: 5,     // Añadido para más altura
  },
  detailsSubheader: {
    fontSize: 16,
    color: '#690B22',
    marginTop: 4,
  },
  divider: {
    marginVertical: 15,
    height: 1,
  },
  mealGroup: {
    marginBottom: 15,      // Reducido de 25 a 15 para acercar las tarjetas
    alignItems: 'stretch',  // Hace que los elementos ocupen todo el ancho disponible
  },
  
  // Nuevo estilo para el título de tipo de comida
  mealTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 8,
    paddingLeft: 2,         // Alineado a la izquierda
    textAlign: 'left',
  },
  
  // Rediseño completo del estilo para tipo de comida como banda superior
  mealItemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,      // Reducido de 12 a 8 para menor espacio entre tarjetas
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
    alignSelf: 'stretch',   // Hace que ocupe todo el ancho
    marginLeft: 0,          // Alineado a la izquierda
  },
  
  mealItemContent: {
    flexDirection: 'column',  // Cambiado a columna para poner el tag arriba
  },
  
  mealItemTipoTag: {
    backgroundColor: '#690B22',
    width: '100%',          // Ocupa todo el ancho
    paddingVertical: 6,
    alignItems: 'flex-start', // Alinear el texto a la izquierda
    paddingHorizontal: 15,
    marginBottom: 0,        // Quitar margen inferior
  },
  
  mealItemTipoText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  
  // Contenedor principal de información mejorado con estilo más redondeado
  mealItemInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcfcfc', // Color de fondo ligeramente diferente
    borderRadius: 16,  // Más redondeado
    margin: 8, // Margen interior para separarlo del borde de la tarjeta
    overflow: 'hidden', // Para que la imagen respete los bordes redondeados
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Sombra sutil para dar profundidad
  },
  
  mealItemImage: {
    width: 90,
    height: 90,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 16, // Redondeado en las esquinas izquierdas
    borderBottomLeftRadius: 16,
  },
  
  mealItemNoImage: {
    width: 90,
    height: 90,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mealItemDetails: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'white', // Asegurar que tenga fondo blanco
  },
  mealItemTipoTag: {
    backgroundColor: '#690B22',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  mealItemTipoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  mealItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  mealItemDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  mealItemActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealItemActionText: {
    fontSize: 12,
    color: '#690B22',
    fontWeight: '600',
    marginLeft: 5,
  },

  // Modal de detalle de comida
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    backgroundColor: '#690B22',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  modalClose: {
    padding: 5,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  modalNoImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalNoImageText: {
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic'
  },
  modalContent: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  modalTips: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalTipsText: {
    fontSize: 14,
    color: '#5D4037',
    marginLeft: 10,
    flex: 1,
  },
  modalButton: {
    backgroundColor: '#690B22',
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Estilos para NoMinutaCard
  noMinutaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    elevation: 3,
  },
  noMinutaHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  noMinutaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 15,
    textAlign: 'center',
  },
  infoMedicaContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoMedicaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 12,
  },
  infoMedicaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  infoMedicaLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoMedicaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B4D3E',
  },
  noMinutaInfo: {
    marginBottom: 20,
  },
  noMinutaDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  solicitarButton: {
    backgroundColor: '#690B22',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  solicitarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  
  // Estilos para el formulario de restricciones
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  formHeader: {
    backgroundColor: '#690B22',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formClose: {
    padding: 5,
  },
  formScroll: {
    maxHeight: 400,
    padding: 20,
  },
  formDescription: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
    lineHeight: 22,
  },
  restriccionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  restriccionInfo: {
    flex: 1,
    paddingRight: 10,
  },
  restriccionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  restriccionDesc: {
    fontSize: 14,
    color: '#666',
  },
  formTips: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  formTipsText: {
    fontSize: 14,
    color: '#0D47A1',
    marginLeft: 10,
    flex: 1,
  },
  formButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  formCancelButton: {
    paddingVertical: 15,
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  formCancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  formConfirmButton: {
    paddingVertical: 15,
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#690B22',
  },
  formConfirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },

  // Para cuando no hay una comida específica en un tipo
  noComidaItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  noComidaText: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 14,
  },

  // Mejoras para los elementos de comidas en grupos
  mealItemImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  mealItemNoImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealItemDetails: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  // Estilos para el formulario del perfil no existente
  noPerfilContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noPerfilTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 15,
    textAlign: 'center',
  },
  noPerfilDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  noPerfilButton: {
    backgroundColor: '#690B22',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  noPerfilButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },

  // Estilos para el botón "No quiero restricciones"
  noRestriccionesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noRestriccionesText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Estilos para la información de calorías
  caloriasInfoContainer: {
    marginTop: 10,
    backgroundColor: '#F8F0E8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  infoMedicaValueHighlighted: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#690B22',
  },

  // Nueva cabecera de fecha
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginLeft: 10,
    textTransform: 'capitalize',
  },

  // Estilos para la sección de periodo de vigencia
  periodoVigenciaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: '#F8F0E8',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  periodoVigenciaTextos: {
    marginLeft: 10,
    flex: 1,
  },
  periodoVigenciaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 2,
  },
  vigenciaText: {
    fontSize: 14,
    color: '#666666',
  },
  diasRestantesText: {
    fontWeight: 'bold',
    color: '#690B22',
  },

  // Estilos para el selector de día mejorado (más compacto)
  diaSelectorContainer: {
    marginVertical: 12, // Reducido de 15
  },
  diasScrollView: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  diaButton: {
    paddingVertical: 8, // Reducido de 10
    paddingHorizontal: 14, // Reducido de 16
    backgroundColor: '#F1E3D3',
    borderRadius: 20,
    marginRight: 8, // Reducido de 10
    alignItems: 'center',
    minWidth: 75, // Reducido de 85
  },
  diaButtonHoy: {
    borderWidth: 2,
    borderColor: '#690B22',
  },
  diaButtonSelected: {
    backgroundColor: '#690B22',
  },
  diaButtonText: {
    fontSize: 13, // Reducido de 14
    color: '#1B4D3E',
    fontWeight: 'bold',
  },
  diaButtonSubtext: {
    fontSize: 11, // Reducido de 12
    color: '#666',
    marginTop: 2,
  },
  diaButtonTextSelected: {
    color: 'white',
  },

  // Nuevos estilos para tarjetas de comidas mejoradas
  mealCardsContainer: {
    marginTop: 15,
  },
  mealCardWrapper: {
    marginBottom: 20,
  },
  mealTypeHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 8,
    paddingLeft: 5,
  },
  enhancedMealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 2,
  },
  mealCardImageContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  mealCardImage: {
    width: '100%',
    height: '100%',
  },
  mealCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  mealCardNoImage: {
    height: 150,
    width: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealCardContent: {
    padding: 15,
    backgroundColor: 'rgba(105, 11, 34, 0.85)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  mealCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  mealCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  mealCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  mealCardActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 5,
  },
  noComidaCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eaeaea',
    borderStyle: 'dashed',
  },
  noComidaCardText: {
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Estilos para el badge de tipo de comida en el modal
  modalComidaTipoBadge: {
    backgroundColor: '#690B22',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  modalComidaTipoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },

  // Estilos para el botón de revocar minuta - con mayor visibilidad
  revocarButtonContainer: {
    marginTop: 25,
    marginBottom: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  revocarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ef9a9a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',  // Ancho más grande para mayor visibilidad
  },
  revocarButtonText: {
    color: '#c62828',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 15,
  },
  revocarInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    width: '80%',
  },

  // Estilos para alertas de compatibilidad
  compatibilidadAlerta: {
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatibilidadAlertaBaja: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
  },
  compatibilidadAlertaMedia: {
    backgroundColor: '#ffe8cc',
    borderColor: '#ffd8a8',
  },
  compatibilidadAlertaAlta: {
    backgroundColor: '#d1e7dd',
    borderColor: '#badbcc',
  },
  compatibilidadAlertaTexto: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  compatibilidadAlertaTextoBaja: {
    color: '#856404',
  },
  compatibilidadAlertaTextoMedia: {
    color: '#724c0f',
  },
  compatibilidadAlertaTextoAlta: {
    color: '#155724',
  },
  compatibilidadPorcentaje: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 'auto',
    paddingLeft: 10,
  },

  // Estilos para el componente RestriccionesFallidas
  restriccionesFallidasContainer: {
    backgroundColor: '#FDF3E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#E07A5F',
  },
  restriccionesFallidasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  restriccionesFallidasTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#690B22',
    marginLeft: 6,
  },
  restriccionFallidaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingLeft: 6,
  },
  restriccionFallidaTexto: {
    fontSize: 14,
    color: '#4E342E',
    marginLeft: 8,
    flex: 1,
  },
  restriccionesFallidasNota: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingLeft: 6,
  },
  noComidasContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 10,
  },
  noComidasText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    fontStyle: 'italic',
  },
});
