import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity,
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ResumenNutricionalCard from './ResumenNutricionalCard';
import styles from '../styles/scannerStyles';

// Added onSelectAlimento prop to make food items interactive
const ScanResultView = ({ 
  results, 
  imageUri, 
  serverImageUrl, 
  onScanAgain, 
  compatibilidad, 
  children, 
  onSelectAlimento,
  isReadOnly = false
}) => {
  // Use the image from the server if available, otherwise use the local one
  const displayImageUri = serverImageUrl || imageUri;
  
  // Create a safe version of compatibilidad with defaults
  const safeCompatibilidad = compatibilidad || {
    sodio: { compatible: false, valor: 0 },
    potasio: { compatible: false, valor: 0 },
    fosforo: { compatible: false, valor: 0 }
  };
  
  // If there are no results, show error message
  if (!results || !results.alimentos_detectados) {
    // Simple version for error case
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.errorMessage}>No se pudieron detectar alimentos en la imagen.</Text>
        <Image 
          source={{ uri: displayImageUri }} 
          style={styles.resultImageSmall}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={onScanAgain}
        >
          <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
          <Text style={styles.scanAgainButtonText}>Escanear de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Create an array of all the content items for the FlatList
  // This prevents nesting FlatLists inside ScrollView
  const sections = [
    { type: 'image', data: { uri: displayImageUri } },
    { type: 'title', data: 'Alimentos Detectados' },
    // Use the special type "alimentos" to render food items without nesting FlatLists
    { type: 'alimentos', data: results.alimentos_detectados },
    { type: 'title', data: 'Información Nutricional' },
    { type: 'nutricionCard', data: { totales: results.totales, compatibilidad: safeCompatibilidad } },
    // If there are custom children, add them as a section
    children && { type: 'custom', data: children },
  ].filter(Boolean); // Filter out any null/undefined sections

  // Render each section based on its type
  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'image':
        return (
          <Image 
            source={{ uri: item.data.uri }} 
            style={styles.resultImage}
            resizeMode="cover"
            // Add additional image loading properties
            loadingIndicatorSource={{ uri: 'https://via.placeholder.com/400?text=Cargando...' }}
            progressiveRenderingEnabled={true}
            fadeDuration={300} // Make image fade in smoothly
          />
        );
      case 'title':
        return <Text style={styles.resultTitle}>{item.data}</Text>;
      case 'alimentos':
        // MODIFIED: Make food items interactive with TouchableOpacity
        return (
          <View style={localStyles.alimentosContainer}>
            {/* Add user guidance message */}
            {!isReadOnly && (
              <View style={localStyles.guidanceContainer}>
                <MaterialIcons name="info-outline" size={18} color="#1B4D3E" />
                <Text style={localStyles.guidanceText}>
                  Toca cada alimento para seleccionar una versión específica y obtener información nutricional más precisa
                </Text>
              </View>
            )}
            
            {item.data.length > 0 ? (
              item.data.map((alimento, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={localStyles.alimentoItem}
                  onPress={() => onSelectAlimento && onSelectAlimento(alimento)}
                  disabled={isReadOnly}
                >
                  <View style={localStyles.iconContainer}>
                    <MaterialIcons name="restaurant" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={localStyles.alimentoText}>{alimento}</Text>
                  
                  {/* Show edit hint icon if not read-only */}
                  {!isReadOnly && (
                    <MaterialIcons name="edit" size={20} color="#690B22" />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <MaterialIcons name="search-off" size={40} color="#999" />
                <Text style={styles.noResultsText}>
                  No se pudieron identificar alimentos en la imagen
                </Text>
              </View>
            )}
          </View>
        );
      case 'nutricionCard':
        return (
          <ResumenNutricionalCard 
            totales={item.data.totales} 
            compatibilidad={item.data.compatibilidad}
          />
        );
      case 'custom':
        return item.data;
      default:
        return null;
    }
  };

  // Use FlatList as the main container to avoid nesting issues
  return (
    <FlatList
      data={sections}
      renderItem={renderItem}
      keyExtractor={(item, index) => `section-${item.type}-${index}`}
      style={styles.resultContainer}
      contentContainerStyle={styles.resultContent}
    />
  );
};

// Local styles just for this component
const localStyles = StyleSheet.create({
  alimentosContainer: {
    marginBottom: 16,
  },
  alimentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'space-between', // Added to position the edit icon on the right
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#690B22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alimentoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  guidanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  guidanceText: {
    flex: 1,
    fontSize: 14,
    color: '#1B4D3E',
    marginLeft: 8,
    lineHeight: 18,
  },
});

export default ScanResultView;
