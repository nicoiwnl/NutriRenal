import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const options = {
  title: 'Escanear'
};

function QRScannerWeb() {
  return (
    <SafeAreaView style={styles.webContainer}>
      <Text style={styles.webText}>La funcionalidad de cámara no está disponible en la web.</Text>
    </SafeAreaView>
  );
}

function QRScannerApp() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [photo, setPhoto] = useState<any>(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setPhoto(photo);
      } catch (error) {
        Alert.alert('Error', 'No se pudo tomar la foto');
      }
    }
  };

  const retakePicture = () => {
    setPhoto(null);
  };

  const toggleCameraType = () => {
    setType(current => (
      current === CameraType.back ? CameraType.front : CameraType.back
    ));
  };

  const toggleFlash = () => {
    setFlash(current => (
      current === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    ));
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No hay acceso a la cámara</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.button, styles.retakeButton]}
              onPress={retakePicture}>
              <MaterialIcons name="replay" size={28} color="#F1E3D3" />
              <Text style={styles.buttonText}>Volver a tomar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={() => Alert.alert('Éxito', 'Foto guardada')}>
              <MaterialIcons name="check" size={28} color="#F1E3D3" />
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={type}
            flashMode={flash}>
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}>
              <View style={styles.topControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleFlash}>
                  <MaterialIcons
                    name={flash === Camera.Constants.FlashMode.on ? 'flash-on' : 'flash-off'}
                    size={28}
                    color="#F1E3D3"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleCameraType}>
                  <MaterialIcons name="flip-camera-ios" size={28} color="#F1E3D3" />
                </TouchableOpacity>
              </View>
              <View style={styles.bottomControls}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}>
                  <View style={styles.captureInner} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Camera>
        </View>
      )}
    </SafeAreaView>
  );
}

export default Platform.OS === 'web' ? QRScannerWeb : QRScannerApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webText: {
    color: '#690B22',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: '#690B22',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  bottomControls: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  controlButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1E3D3',
    borderWidth: 2,
    borderColor: '#690B22',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    minWidth: 150,
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: '#1B4D3E',
  },
  saveButton: {
    backgroundColor: '#690B22',
  },
  buttonText: {
    color: '#F1E3D3',
    marginLeft: 8,
    fontSize: 16,
  },
});