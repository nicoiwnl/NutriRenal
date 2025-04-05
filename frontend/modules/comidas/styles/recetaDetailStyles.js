import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  recetaImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E0E0E0',
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recetaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D3E',
    flex: 1,
  },
  shareButton: {
    padding: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeChip: {
    backgroundColor: '#E9F5E9',
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#4CAF50',
  },
  categoryChip: {
    backgroundColor: '#F1E3D3',
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#E07A5F',
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 8,
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
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  ingredienteItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ingredienteText: {
    fontSize: 16,
    color: '#333',
  },
  preparacionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  materialesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8E8D8',
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    backgroundColor: '#690B22',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
