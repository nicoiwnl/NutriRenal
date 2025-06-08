import { StyleSheet } from 'react-native';

// Estilos para el modal
export const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  alimentoSelected: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    marginTop: 10,
    width: '100%',
  },
  buttonBuscar: {
    backgroundColor: '#1B4D3E',
  },
  buttonRegistrar: {
    backgroundColor: '#690B22',
    marginTop: 16,
  },
  buttonClose: {
    backgroundColor: '#999',
    marginTop: 16,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 8,
  },
});

// Estilos para el componente de detección
export const detectionStyles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#690B22',
    fontWeight: '500',
    fontSize: 14,
  },
  detectedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  detectedContent: {
    flex: 1,
    marginLeft: 8,
  },
  detectedLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detectedText: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});

// Estilos para el componente de coincidencias múltiples
export const multipleMatchStyles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#C8E6C9',
  },
  headerText: {
    flex: 1,
    marginLeft: 8,
    color: '#1B4D3E',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 12,
  },
  instruction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    flex: 1,
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
});

// Estilos para ScanResultHeader
export const headerStyles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  imageLoadingText: {
    color: '#690B22',
    marginTop: 8,
    fontWeight: '500',
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noImageText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
});

// Estilos para AlimentoItemList
export const alimentoStyles = StyleSheet.create({
  alimentoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alimentoItemInteractive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  alimentoTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  alimentoNombre: {
    fontSize: 16,
    color: '#333333',
  },
  alimentoUnidad: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  alimentoItemUpdated: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  updatedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  updatedBadgeText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  selectionHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  noAlimentosText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  instructionBanner: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  instructionText: {
    flex: 1,
    marginLeft: 10,
    color: '#1B4D3E',
    fontSize: 14,
  },
});

// Estilos para recomendaciones
export const recomendacionesStyles = StyleSheet.create({
  recomendacionesContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  compatibilidadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  compatibilidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recomendacionesText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
});

// Estilos para botones inferiores
export const buttonStyles = StyleSheet.create({
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  scanAgainButton: {
    backgroundColor: '#690B22',
  },
  homeButton: {
    backgroundColor: '#1B4D3E',
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

// Estilos para LoadingOverlay
export const overlayStyles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
});

// Estilos principales combinados
const scanResultStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
  },
  resultContent: {
    padding: 16,
    // Remove the hard-coded paddingBottom here as we'll set it dynamically
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 16,
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  emptyResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 10,
  },
  emptyResultMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },

  // Bottom buttons styles - More compact
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12, // Reduced from 16
    backgroundColor: '#F8E8D8',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Ensure buttons are above content
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 150,
  },
  scanAgainButton: {
    backgroundColor: '#690B22',
  },
  backButton: {
    backgroundColor: '#1B4D3E',
  },
  goHomeButton: {
    backgroundColor: '#1B4D3E',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default scanResultStyles;
