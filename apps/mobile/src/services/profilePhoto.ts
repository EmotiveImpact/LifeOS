/**
 * Your photo, for the You tab and Your details (Edem, 21 Nov 2026). It stays on this phone: a small square copy in the
 * app's own Documents/profile folder (a 192px picture on the web preview), remembered on the device only. It is never
 * put in the synced profile and never sent anywhere, and on iPhone the folder is kept out of iCloud and computer
 * backups (LifeIntelligenceModule.swift); Android backups are off for the whole app. Only the file's name is stored,
 * because iOS can move the app's folder between updates, so the full address is rebuilt each time it loads.
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

const FOLDER = 'profile';

/** The stored value is a data address on the web and a file name on a phone (older builds kept a full file address). */
function resolve(stored: string): string | null {
  if (Platform.OS === 'web' || stored.startsWith('data:')) return stored;
  const name = stored.split('/').pop();
  if (!name) return null;
  try {
    const file = new File(Paths.document, FOLDER, name);
    return file.exists ? file.uri : null;
  } catch { return null; }
}

function load() {
  if (loaded) return;
  loaded = true;
  AsyncStorage.getItem(KEY).then(v => {
    if (!v) return;
    const uri = resolve(v);
    if (!uri) { AsyncStorage.removeItem(KEY).catch(() => {}); return; }
    if (uri !== current) { current = uri; emit(); }
  }).catch(() => {});
}
function subscribe(listener: () => void) { load(); listeners.add(listener); return () => { listeners.delete(listener); }; }

/** The photo's address on this device, or null when there isn't one (show initials). */
export function useProfilePhoto(): string | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

/** Shows `uri` now and remembers `stored` (the file name on a phone, the data address on the web). */
async function save(uri: string | null, stored: string | null = uri) {
  current = uri; emit();
  try { if (stored) await AsyncStorage.setItem(KEY, stored); else await AsyncStorage.removeItem(KEY); } catch { /* still shown this session */ }
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
    const dir = new Directory(Paths.document, FOLDER);
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
  const dir = new Directory(Paths.document, FOLDER);
  dir.create({ intermediates: true, idempotent: true });
  const name = `photo-${Date.now()}.jpg`;
  const destination = new File(dir, name);
  await new File(asset.uri).copy(destination, { overwrite: true });
  clearCopies(destination.uri);
  await save(destination.uri, name);
  return true;
}

export async function removeProfilePhoto() {
  clearCopies();
  await save(null);
}
