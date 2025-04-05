import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importar componentes, hooks y estilos del módulo
import ScanResultView from '../modules/scanner/components/ScanResultView';
import LoadingView from '../modules/scanner/components/LoadingView';
import useScanResult from '../modules/scanner/hooks/useScanResult';
import styles from '../modules/scanner/styles/scannerStyles';

export default function ScanResultScreen({ route }) {
  const {
    loading,
    results,
    imageUri,
    handleScanAgain
  } = useScanResult(route);

  // Mostrar pantalla de carga mientras se procesa
  if (loading) {
    return <LoadingView message="Analizando el alimento..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScanResultView
        results={results}
        imageUri={imageUri}
        onScanAgain={handleScanAgain}
      />
    </SafeAreaView>
  );
}
