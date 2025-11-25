import type { CropSettings } from './types';

export type ProcessPayload = {
  file: File;
  targetWidth: number;
  targetHeight: number;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
  keepAspectRatio?: boolean;
  autoOrient?: boolean;
  crop?: CropSettings | null;
};

export async function processImage({
  file,
  targetWidth,
  targetHeight,
  format,
  quality,
  keepAspectRatio = false,
  autoOrient = false,
  crop
}: ProcessPayload): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const source = resolveSourceRect(imageBitmap, crop);
  const resolvedTarget = resolveTargetSizeFromOrientation(
    source,
    { width: targetWidth, height: targetHeight },
    autoOrient
  );
  const output = resolveOutputSize(source, resolvedTarget.width, resolvedTarget.height, keepAspectRatio);

  const canvas = new OffscreenCanvas(output.width, output.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }

  ctx.drawImage(
    imageBitmap,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    0,
    0,
    output.width,
    output.height
  );

  const blob = await canvas.convertToBlob({ type: format, quality });
  imageBitmap.close();
  return blob;
}

export type CropPreviewPayload = {
  file: File | Blob;
  crop: CropSettings;
  maxSize?: number;
};

export async function createCropPreviewBlob({
  file,
  crop,
  maxSize = 200
}: CropPreviewPayload): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const source = resolveSourceRect(imageBitmap, crop);

  const aspect = source.sw / source.sh || 1;
  const safeSize = Math.max(32, Math.min(maxSize, 512));
  const target =
    aspect >= 1
      ? { width: safeSize, height: Math.max(1, Math.round(safeSize / aspect)) }
      : { width: Math.max(1, Math.round(safeSize * aspect)), height: safeSize };

  const canvas = new OffscreenCanvas(target.width, target.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }

  ctx.drawImage(imageBitmap, source.sx, source.sy, source.sw, source.sh, 0, 0, target.width, target.height);
  const blob = await canvas.convertToBlob({ type: 'image/png', quality: 0.92 });
  imageBitmap.close();
  return blob;
}

type SourceRect = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

function resolveSourceRect(image: ImageBitmap, crop?: CropSettings | null): SourceRect {
  if (!crop || crop.width <= 0 || crop.height <= 0) {
    return { sx: 0, sy: 0, sw: image.width, sh: image.height };
  }

  const sx = clamp(crop.x, 0, image.width);
  const sy = clamp(crop.y, 0, image.height);
  const maxWidth = image.width - sx;
  const maxHeight = image.height - sy;

  return {
    sx,
    sy,
    sw: Math.max(1, Math.min(crop.width, maxWidth)),
    sh: Math.max(1, Math.min(crop.height, maxHeight))
  };
}

function resolveOutputSize(
  source: SourceRect,
  targetWidth: number,
  targetHeight: number,
  keepAspectRatio: boolean
) {
  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));

  if (!keepAspectRatio) {
    return { width, height };
  }

  const aspect = source.sw / source.sh || 1;
  const scale = Math.min(width / source.sw, height / source.sh);
  const fittedWidth = Math.max(1, Math.round(source.sw * scale));
  const fittedHeight = Math.max(1, Math.round(source.sh * scale));

  // 再計算で 0 になるのを避けるため、最低値を保証
  return { width: fittedWidth, height: fittedHeight };
}

function resolveTargetSizeFromOrientation(
  source: SourceRect,
  target: { width: number; height: number },
  autoOrient: boolean
) {
  const normalized = {
    width: Math.max(1, Math.round(target.width)),
    height: Math.max(1, Math.round(target.height))
  };

  if (!autoOrient) {
    return normalized;
  }

  const sourceIsLandscape = source.sw >= source.sh;
  const targetIsLandscape = normalized.width >= normalized.height;
  if (sourceIsLandscape === targetIsLandscape) {
    return normalized;
  }

  return { width: normalized.height, height: normalized.width };
}
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
