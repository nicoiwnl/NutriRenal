import React from 'react';
import ScanResultView from './ScanResultView';

// Este componente sirve como alias o redirección al componente ScanResultView
// para mantener la compatibilidad con código existente que pueda estar referenciándolo
const ScannerResult = (props) => {
  console.warn(
    'ScannerResult está obsoleto, por favor use ScanResultView directamente'
  );
  return <ScanResultView {...props} />;
};

export default ScannerResult;
