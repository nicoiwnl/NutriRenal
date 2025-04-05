import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';

// Importar componentes, hooks y estilos del módulo
import WebPlaceholder from '../modules/scanner/components/WebPlaceholder';
import CameraGalleryOptions from '../modules/scanner/components/CameraGalleryOptions';
import ImagePreview from '../modules/scanner/components/ImagePreview';
import useScanner from '../modules/scanner/hooks/useScanner';
import styles from '../modules/scanner/styles/scannerStyles';

export const options = {
  title: 'Escanear Alimento'  // Título más descriptivo
};

export default function QRScannerScreen() {
  const {
    capturedImage,
    loading,
    handleOpenCamera,
    handleOpenGallery,
    handleProcessImage,
    handleDeleteImage,
    handleGoBack,
    isWeb
  } = useScanner();

  // Versión web simplificada
  if (isWeb) {
    return <WebPlaceholder />;
  }

  // Si ya hay una imagen capturada, mostrar la vista previa
  if (capturedImage) {
    return (
      <ImagePreview
        imageUri={capturedImage}
        onProcess={handleProcessImage}
        onDelete={handleDeleteImage}
        loading={loading}
      />
    );
  }
  
  // Vista normal para seleccionar cámara o galería
  return (
    <SafeAreaView style={styles.container}>
      <CameraGalleryOptions
        onCameraPress={handleOpenCamera}
        onGalleryPress={handleOpenGallery}
      />
    </SafeAreaView>
  );
}