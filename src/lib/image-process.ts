import type { CropSettings } from './types';

export type ProcessPayload = {
  file: File;
  targetWidth: number;
  targetHeight: number;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
  crop?: CropSettings | null;
};

export async function processImage({
  file,
  targetWidth,
  targetHeight,
  format,
  quality,
  crop
}: ProcessPayload): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }

  const source = crop
    ? {
        sx: crop.x,
        sy: crop.y,
        sw: crop.width,
        sh: crop.height
      }
    : {
        sx: 0,
        sy: 0,
        sw: imageBitmap.width,
        sh: imageBitmap.height
      };

  ctx.drawImage(
    imageBitmap,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    0,
    0,
    targetWidth,
    targetHeight
  );

  const blob = await canvas.convertToBlob({ type: format, quality });
  imageBitmap.close();
  return blob;
}
