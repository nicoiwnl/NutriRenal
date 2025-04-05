import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: Platform.OS === 'web' ? '100%' : '90%',
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }
    }),
    marginVertical: Platform.select({ ios: 30, android: 40 }), // mayor separación vertical en móviles
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#F1E3D3',
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#690B22',
  },
  toggleText: {
    color: '#1B4D3E',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#F1E3D3',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E07A5F',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#1B4D3E',
  },
  loginButton: {
    backgroundColor: '#690B22',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#F1E3D3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#1B4D3E',
    fontSize: 14,
  },
  dateText: {
    flex: 1,
    paddingVertical: 12,
    color: '#1B4D3E',
  },
  loginButtonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  loginMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E3D3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  methodButtonActive: {
    backgroundColor: '#690B22',
  },
  methodText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#690B22',
    fontWeight: '500',
  },
  methodTextActive: {
    color: '#F1E3D3',
  },
  // Estilos para el selector de fecha
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dateButtonText: {
    color: '#1B4D3E',
    fontSize: 16,
  },
  
  // Estilos para el selector de rol
  roleContainer: {
    marginVertical: 15,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 10,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E3D3',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  roleOptionSelected: {
    backgroundColor: '#690B22',
  },
  roleText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#690B22',
    fontWeight: '500',
  },
  roleTextSelected: {
    color: 'white',
  },
  
  // Estilos para el selector de género - similar al selector de rol
  genderContainer: {
    marginVertical: 15,
  },
  genderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 10,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E3D3',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  genderOptionSelected: {
    backgroundColor: '#690B22',
  },
  genderText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#690B22',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: 'white',
  },
});
