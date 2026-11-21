/**
 * Your photo, for the You tab and Your details (Edem, 21 Nov 2026). It stays on this phone: a small square copy in the
 * app's own documents (a 192px picture on the web preview), remembered on the device only. It is never put in the
 * synced profile and never sent anywhere.
 */
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

const KEY = 'life.profile-photo';
let current: string | null = null;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

function load() {
  if (loaded) return;
  loaded = true;
  AsyncStorage.getItem(KEY).then(v => { if (v && v !== current) { current = v; emit(); } }).catch(() => {});
}
function subscribe(listener: () => void) { load(); listeners.add(listener); return () => { listeners.delete(listener); }; }

/** The photo's address on this device, or null when there isn't one (show initials). */
export function useProfilePhoto(): string | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

async function save(uri: string | null) {
  current = uri; emit();
  try { if (uri) await AsyncStorage.setItem(KEY, uri); else await AsyncStorage.removeItem(KEY); } catch { /* still shown this session */ }
}

/** A centred square, drawn small, so the web preview can keep it after a reload. */
async function squareDataUri(src: string, size: number): Promise<string> {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('photo')); img.src = src; });
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  canvas.getContext('2d')?.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.82);
}

function clearCopies(keep?: string) {
  if (Platform.OS === 'web') return;
  try {
    const dir = new Directory(Paths.document, 'profile');
    if (!dir.exists) return;
    for (const item of dir.list()) if (item instanceof File && item.uri !== keep) item.delete();
  } catch { /* nothing to tidy */ }
}

/** Pick a photo from the library, cropped square. Returns false when the person backed out. */
export async function chooseProfilePhoto(): Promise<boolean> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7, selectionLimit: 1 });
  const asset = result.canceled ? null : result.assets?.[0];
  if (!asset) return false;
  if (Platform.OS === 'web') { await save(await squareDataUri(asset.uri, 192)); return true; }
  const dir = new Directory(Paths.document, 'profile');
  dir.create({ intermediates: true, idempotent: true });
  const destination = new File(dir, `photo-${Date.now()}.jpg`);
  await new File(asset.uri).copy(destination, { overwrite: true });
  clearCopies(destination.uri);
  await save(destination.uri);
  return true;
}

export async function removeProfilePhoto() {
  clearCopies();
  await save(null);
}
