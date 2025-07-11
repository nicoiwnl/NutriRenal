import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ScanResultHeader = ({ imageUri, serverImageUrl, loadingImage, setLoadingImage }) => {
  
  const [internalLoading, setInternalLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  
  const isLoading = loadingImage !== undefined ? loadingImage : internalLoading;
  const handleLoadStart = () => {
    if (setLoadingImage) setLoadingImage(true);
    setInternalLoading(true);
    setImageError(false);
  };
  
  const handleLoadEnd = () => {
    if (setLoadingImage) setLoadingImage(false);
    setInternalLoading(false);
  };
  
  const handleError = () => {
    if (setLoadingImage) setLoadingImage(false);
    setInternalLoading(false);
    setImageError(true);
  };
  
  // URL para mostrar
  const useServerImage = !!serverImageUrl;
  const displayUrl = serverImageUrl || imageUri;
  
  
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (setLoadingImage) setLoadingImage(false);
        setInternalLoading(false);
      }, 10000); // 10 segundos de timeout
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  return (
    <View style={styles.imageContainer}>
      {displayUrl ? (
        <>
          <Image
            source={{ uri: displayUrl }}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            // Propiedades para mejorar la experiencia de carga
            progressiveRenderingEnabled={true}
            fadeDuration={300}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#690B22" />
            </View>
          )}
          {imageError && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="broken-image" size={48} color="#ddd" />
            </View>
          )}
        </>
      ) : (
        <View style={styles.noImage}>
          <MaterialIcons name="image-not-supported" size={48} color="#ddd" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  }
});

export default ScanResultHeader;

