import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ComunidadHeader = ({ 
  onMyPublicationsPress, 
  onNewPublicationPress,
  onForosPress,
  foroActual,
  onSelectForo
}) => {
  // Comprobar si hay un foro seleccionado
  const foroNombre = foroActual?.nombre || "General";
  const esForoGeneral = foroActual?.es_general || !foroActual;

  return (
    <View style={styles.header}>
      <View style={styles.headerRight}>
        {/* Botón para Mis Publicaciones */}
        <TouchableOpacity 
          style={styles.misPublicacionesButton}
          onPress={onMyPublicationsPress}
        >
          <MaterialIcons name="person" size={14} color="#690B22" />
          <Text style={styles.misPublicacionesText}>Mis Publicaciones</Text>
        </TouchableOpacity>

        {/* Botón para Foros */}
        <TouchableOpacity 
          style={styles.misPublicacionesButton}
          onPress={onForosPress}
          testID="boton-foros"
        >
          <MaterialIcons name="forum" size={14} color="#690B22" />
          <Text style={styles.misPublicacionesText}>Foros</Text>
        </TouchableOpacity>

        {/* Botón de selección de foro (solo muestra foros suscritos) */}
        <TouchableOpacity 
          style={styles.foroSelector}
          onPress={onSelectForo}
          accessibilityHint="Selecciona de tus foros suscritos"
        >
          <View style={styles.foroSelectorContent}>
            <MaterialIcons 
              name={esForoGeneral ? "public" : "forum"} 
              size={14} 
              color="#FFFFFF" 
            />
            <Text style={styles.foroSelectorText} numberOfLines={1}>
              {foroNombre}
            </Text>
          </View>
          <MaterialIcons name="arrow-drop-down" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#690B22',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  misPublicacionesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#690B22',
  },
  misPublicacionesText: {
    color: '#690B22',
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 11,
  },
  foroSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    justifyContent: 'space-between',
    minWidth: 100,
    maxWidth: 150,
  },
  foroSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foroSelectorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
    flex: 1,
  },
});

export default ComunidadHeader;
