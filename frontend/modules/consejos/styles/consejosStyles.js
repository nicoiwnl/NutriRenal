import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 20,
  },
  consejoContainer: {
    marginRight: 20,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4,
    marginHorizontal: 10,
  },
  consejoContainerWeb: {
    width: 500,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    marginVertical: 10,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'justify',
  },
  button: {
    marginBottom: 28, 
    backgroundColor: '#690B22',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});
