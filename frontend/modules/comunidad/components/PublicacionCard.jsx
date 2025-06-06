import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getImageUrl } from '../../../utils/imageHelper';

const PublicacionCard = ({ publicacion, onPress, showDeleteButton = false, onDelete }) => {
  // Verificar si la publicación tiene datos válidos
  if (!publicacion) return null;

  // Función para formatear fechas de manera simple sin usar date-fns
  const formatearFechaRelativa = (fechaStr) => {
    if (!fechaStr) return 'Fecha desconocida';
    try {
      const fecha = new Date(fechaStr);
      const ahora = new Date();
      const diferenciaMilisegundos = ahora - fecha;
      
      // Convertir a minutos, horas, días
      const minutos = Math.floor(diferenciaMilisegundos / (1000 * 60));
      const horas = Math.floor(minutos / 60);
      const dias = Math.floor(horas / 24);
      
      if (minutos < 1) return 'hace un momento';
      if (minutos < 60) return `hace ${minutos} minutos`;
      if (horas < 24) return `hace ${horas} horas`;
      if (dias < 7) return `hace ${dias} días`;
      
      // Para fechas más antiguas, mostrar fecha formateada
      return fecha.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Contar comentarios - Mejorado para manejar diferentes formatos de datos
  const numComentarios = (() => {
    // Caso 1: Si tenemos un campo num_comentarios o cantidad_comentarios
    if (publicacion.num_comentarios !== undefined) return publicacion.num_comentarios;
    if (publicacion.cantidad_comentarios !== undefined) return publicacion.cantidad_comentarios;
    if (publicacion.comentarios_count !== undefined) return publicacion.comentarios_count;
    
    // Caso 2: Si tenemos un array de comentarios completos
    if (Array.isArray(publicacion.comentarios)) return publicacion.comentarios.length;
    
    // Caso 3: Si no tenemos ningún dato, mostrar 0
    console.log(`No se encontró información de comentarios para la publicación ${publicacion.id}`);
    return 0;
  })();
  
  // Obtener información del foro
  const foroNombre = publicacion.foro_nombre || publicacion.nombre_foro || 'General';

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(publicacion)}>
      <View style={styles.card}>
        {/* Cabecera de la tarjeta */}
        <View style={styles.cardHeader}>
          {/* User avatar */}
          <Image 
            source={{ 
              uri: getImageUrl(
                publicacion.autor_foto || publicacion.autor?.foto, 
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
              ) 
            }}
            style={styles.userAvatar}
          />
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {publicacion.autor_nombre || publicacion.autor?.nombre || 'Usuario'}
            </Text>
            <Text style={styles.timeAgo}>{formatearFechaRelativa(publicacion.fecha_creacion)}</Text>
          </View>

          {/* Botón de eliminar (solo si showDeleteButton es true) */}
          {showDeleteButton && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation(); // Evitar que se active el onPress del card
                onDelete(publicacion.id);
              }}
            >
              <MaterialIcons name="delete" size={20} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>

        {/* Asunto de la publicación */}
        <Text style={styles.title}>{publicacion.asunto}</Text>
        
        {/* Contenido abreviado */}
        <Text style={styles.content} numberOfLines={3}>
          {publicacion.contenido}
        </Text>
        
        {/* Pie de la tarjeta */}
        <View style={styles.cardFooter}>
          <View style={styles.statsContainer}>
            <MaterialIcons name="chat" size={16} color="#690B22" />
            <Text style={styles.statsText}>
              {numComentarios} {numComentarios === 1 ? 'comentario' : 'comentarios'}
            </Text>
          </View>
          <View style={styles.foroContainer}>
            <MaterialIcons name="forum" size={16} color="#1B4D3E" />
            <Text style={styles.foroText}>{foroNombre}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Define local styles instead of conflicting with imported styles
const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#690B22',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
    color: '#1B4D3E',
  },
  timeAgo: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  content: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  foroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foroText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#1B4D3E',
  },
  deleteButton: {
    padding: 8,
  },
});

export default PublicacionCard;
