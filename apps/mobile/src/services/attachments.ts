import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';
import type { Attachment } from '@life/brain';

const reader = Platform.OS === 'web' ? null : requireOptionalNativeModule<{ readText(uri: string): Promise<string> }>('LifeIntelligence');
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_TEXT = 40000;
const ownedDirectory = () => new Directory(Paths.document, 'attachments');
function safeExtension(name: string, mime: string): string {
  const suffix = name.match(/\.[A-Za-z0-9]{1,8}$/)?.[0].toLowerCase();
  if (suffix) return suffix;
  return mime === 'application/pdf' ? '.pdf' : mime.startsWith('image/') ? `.${mime.slice(6).replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '') || 'jpg'}` : '.txt';
}
async function persistAttachment(uri: string, id: string, name: string, mime: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  const directory = ownedDirectory();
  directory.create({ intermediates: true, idempotent: true });
  const destination = new File(directory, `${id}${safeExtension(name, mime)}`);
  await new File(uri).copy(destination, { overwrite: true });
  await removeAttachmentCopy({ uri });
  return destination.uri;
}
export async function pickAttachment(kind: 'camera' | 'photos' | 'files'): Promise<Attachment | null> {
  let uri: string, name: string, mime: string, size: number, text: string | undefined;
  if (kind === 'files') {
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/*', 'application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
    if (result.canceled) return null;
    const asset = result.assets[0];
    uri = asset.uri; name = asset.name; mime = asset.mimeType ?? 'application/octet-stream'; size = asset.size ?? 0;
    if (size > MAX_BYTES) { await removeAttachmentCopy({ uri }); throw new Error('Choose a file smaller than 10 MB.'); }
    if (mime.startsWith('text/') || /\.(txt|md|csv)$/i.test(name)) text = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(uri).text();
  } else {
    if (kind === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) throw new Error('Camera access is off. You can choose a photo or file instead.');
    }
    const result = kind === 'camera' ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, selectionLimit: 1 });
    if (result.canceled) return null;
    const asset = result.assets[0];
    uri = asset.uri; name = asset.fileName ?? 'Photo.jpg'; mime = asset.mimeType ?? 'image/jpeg'; size = asset.fileSize ?? 0;
  }
  if (!size && Platform.OS !== 'web') size = new File(uri).size;
  if (size > MAX_BYTES) { await removeAttachmentCopy({ uri }); throw new Error('Choose a file smaller than 10 MB.'); }
  if (!text && (mime.startsWith('image/') || mime === 'application/pdf') && reader) {
    try { text = await reader.readText(uri); } catch { /* Keep the actual photo, visibly unread; never substitute a sample letter. */ }
  }
  if (text && text.length > MAX_TEXT) { await removeAttachmentCopy({ uri }); throw new Error('This document is longer than the current 40,000-character reading limit. Choose a shorter document; it has not been silently truncated.'); }
  const id = Crypto.randomUUID();
  uri = await persistAttachment(uri, id, name, mime);
  return { id, uri, name, mime, size, text: text?.trim() || undefined, status: text?.trim() ? 'ready' : 'needs-reader' };
}
/** Remove only app-owned picker/cache copies, never the user's original. */
export async function removeAttachmentCopy(attachment: Pick<Attachment, 'uri'>): Promise<void> {
  if (Platform.OS === 'web') return;
  const owned = ownedDirectory().uri;
  if (attachment.uri.startsWith(Paths.cache.uri) || attachment.uri.startsWith(owned)) { const copy = new File(attachment.uri); if (copy.exists) copy.delete(); }
}
