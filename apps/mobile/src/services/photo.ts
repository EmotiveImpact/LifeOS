/** The longest side a photo is sent at: enough to read a plate or a label, small enough to send quickly (Phase 27). */
export const MAX_PHOTO_SIDE = 1280;

/** The web preview's version of `photo.native.ts`: the browser draws the photo smaller and encodes it as a JPEG. */
export async function smallPhoto(uri: string): Promise<{ mime: 'image/jpeg'; data: string }> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('That photo couldn’t be opened.')); image.src = uri; });
  const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
  const pen = canvas.getContext('2d');
  if (!pen) throw new Error('That photo couldn’t be opened.');
  pen.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { mime: 'image/jpeg', data: canvas.toDataURL('image/jpeg', 0.7).split(',')[1] ?? '' };
}
