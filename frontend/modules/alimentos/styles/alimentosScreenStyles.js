import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    padding: 20,
  },
  searchBarContainer: Platform.select({
    web: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      position: 'relative',
    },
    default: {
      marginBottom: 10,
    }
  }),
  searchInput: Platform.select({
    web: {
      flex: 1,
      backgroundColor: '#fff',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 8,
      fontSize: 14,
      paddingRight: 40,
    },
    default: {
      backgroundColor: '#fff',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 8,
      fontSize: 16,
    }
  }),
  searchIcon: Platform.select({
    web: {
      position: 'absolute',
      right: 10,
      pointerEvents: 'none',
    },
    default: {
      display: 'none',
    }
  }),
  modeToggleContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  modeToggle: Platform.select({
    web: {},
    default: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: 10,
    }
  }),
  toggleButton: Platform.select({
    web: {
      width: '48%',
      paddingVertical: 6,
      paddingHorizontal: 8,
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#690B22',
      marginLeft: 5,
    },
    default: {
      flex: 1,
      paddingVertical: 6,
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#690B22',
    }
  }),
  selectedButton: {
    backgroundColor: '#690B22',
  },
  toggleText: {
    fontSize: Platform.select({ web: 14, default: 16 }),
    color: '#690B22',
    paddingHorizontal: 4,
  },
  selectedText: {
    color: '#F1E3D3',
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
    fontStyle: 'italic',
  },
  item: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  expandedContainer: {
    backgroundColor: '#F1E3D3',
    borderRadius: 8,
    marginLeft: 15,
    marginBottom: 10,
    padding: 8,
  },
  childItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 5,
  },
  childText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  }
});
