import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 20,
  },
  list: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  consejoContainer: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 22, // Aumentado para más separación entre elementos
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4, // Aumentado para mayor profundidad visual
    width: Platform.OS === 'web' ? '85%' : '94%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12, // Añadido espacio después de la imagen
  },
  title: {
    fontSize: 20, // Aumentado tamaño
    fontWeight: 'bold',
    color: '#690B22',
    marginVertical: 12, // Aumentado espacio vertical
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#1B4D3E',
    lineHeight: 22, // Añadido lineHeight para mejor legibilidad
    textAlign: 'justify',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#690B22',
    marginTop: 10,
  },
});
