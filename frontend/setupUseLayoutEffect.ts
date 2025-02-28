import React, { useEffect, useLayoutEffect } from 'react';

if (typeof window === 'undefined') {
  // En SSR, sustituir useLayoutEffect por useEffect para evitar warnings
  // @ts-ignore
  React.useLayoutEffect = useEffect;
}
