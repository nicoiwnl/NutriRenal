import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    padding: 20,
  },
  list: {
    paddingVertical: 20,
    paddingHorizontal: 5, // Añadido padding horizontal
  },
  categoriaContainer: {
    backgroundColor: '#FFF',
    padding: 18, // Aumentado de 15 a 18
    borderRadius: 10,
    marginBottom: 18, // Aumentado de 10 a 18 para más separación entre elementos
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 3,
    // Estos estilos mejorarán la presentación visual
    alignItems: 'center', // Centrar el texto
    justifyContent: 'center',
    minHeight: 70, // Altura mínima fija para todos los elementos
  },
  categoriaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center', // Asegurar que el texto esté centrado
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
