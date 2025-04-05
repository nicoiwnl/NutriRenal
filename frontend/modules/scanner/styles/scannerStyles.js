import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#F8E8D8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webText: {
    color: '#690B22',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  cameraButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  galleryButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    position: 'absolute',
    bottom: 30,
  },
  backButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  
  // Estilos para la vista previa de la imagen
  imagePreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8E8D8',
  },
  previewImage: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  previewButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 150,
  },
  processButton: {
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    marginLeft: 10,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },

  // Estilo para pantalla de resultados
  resultContainer: {
    flex: 1,
    backgroundColor: '#F8E8D8',
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  resultContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  resultImageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  resultImage: {
    width: width * 0.8,
    height: width * 0.6,
    borderRadius: 8,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  resultFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultFooterButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E8D8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#690B22',
  }
});
