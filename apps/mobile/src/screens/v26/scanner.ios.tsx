import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Camera, isScannedCode, useCameraPermission, useObjectOutput, type ScannedObject, type ScannedObjectType } from 'react-native-vision-camera';
import { validBarcode } from '@life/core';

/** The codes on food packs: EAN-13, EAN-8 and UPC-E (UPC-A arrives as EAN-13). */
const FOOD_CODES: ScannedObjectType[] = ['ean-13', 'ean-8', 'upc-e'];

/**
 * The live barcode camera on iPhone (Phase 27): VisionCamera's own code reader, no frame processors. A code is only
 * passed on once its check digit is right, and the same code isn't passed on twice in a row.
 */
export function BarcodeCamera({ active, onCode }: { active: boolean; onCode: (code: string) => void }) {
  const permission = useCameraPermission();
  const last = useRef('');
  const types = useMemo(() => FOOD_CODES, []);
  const onObjectsScanned = useCallback((objects: ScannedObject[]) => {
    for (const object of objects) {
      if (!isScannedCode(object) || !object.value || !validBarcode(object.value) || object.value === last.current) continue;
      last.current = object.value;
      onCode(object.value);
      return;
    }
  }, [onCode]);
  const output = useObjectOutput({ types, onObjectsScanned });
  // Asked once, when the scanner opens. A no leaves the typed code, which always works.
  const { hasPermission, canRequestPermission, requestPermission } = permission;
  useEffect(() => { if (!hasPermission && canRequestPermission) void requestPermission(); }, [hasPermission, canRequestPermission, requestPermission]);
  if (!hasPermission) return null;
  return <Camera style={StyleSheet.absoluteFill} device="back" isActive={active} outputs={[output]} resizeMode="cover" />;
}

/** Whether this phone scans codes with its camera. */
export const scansCodes = true;
