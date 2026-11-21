import { File } from 'expo-file-system';
import { Images } from 'react-native-nitro-image';

/** The longest side a photo is sent at: enough to read a plate or a label, small enough to send quickly (Phase 27). */
export const MAX_PHOTO_SIDE = 1280;
const QUALITY = 70;

/**
 * A photo made small for Life's model: at most 1,280 pixels on its longest side, as a JPEG, base64. The copy made on
 * the way is deleted at once; the person's own photo is never changed.
 */
export async function smallPhoto(uri: string): Promise<{ mime: 'image/jpeg'; data: string }> {
  const path = uri.startsWith('file://') ? decodeURIComponent(uri.slice('file://'.length)) : uri;
  const image = await Images.loadFromFileAsync(path);
  const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(image.width, image.height));
  const small = scale < 1 ? await image.resizeAsync(Math.round(image.width * scale), Math.round(image.height * scale)) : image;
  const saved = await small.saveToTemporaryFileAsync('jpg', QUALITY);
  const copy = new File(saved.startsWith('file://') ? saved : `file://${saved}`);
  try { return { mime: 'image/jpeg', data: await copy.base64() }; }
  finally { if (copy.exists) copy.delete(); }
}
