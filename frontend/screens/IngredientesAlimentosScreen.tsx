import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// Reutilizando componentes del módulo de scanner pero con propósito específico
import WebPlaceholder from '../modules/scanner/components/WebPlaceholder';
import CameraGalleryOptions from '../modules/scanner/components/CameraGalleryOptions';
import ImagePreview from '../modules/scanner/components/ImagePreview';
import useScanner from '../modules/scanner/hooks/useScanner';
import styles from '../modules/scanner/styles/scannerStyles';

export const options = {
  title: 'Escanear Ingredientes'
};

// Componente específico para escanear empaques de alimentos e ingredientes
export default function IngredientesAlimentosScreen() {
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
  
  // Vista para seleccionar cámara o galería con instrucciones específicas
  return (
    <SafeAreaView style={styles.container}>
      <CameraGalleryOptions
        onCameraPress={handleOpenCamera}
        onGalleryPress={handleOpenGallery}
        // Aquí se podrían pasar props específicas para personalizar el texto de instrucciones
      />
    </SafeAreaView>
  );
}
