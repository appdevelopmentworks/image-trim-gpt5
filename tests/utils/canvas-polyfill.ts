import { createCanvas, loadImage } from '@napi-rs/canvas';

function normalizeQuality(quality?: number) {
  const clamped = Math.max(0, Math.min(1, quality ?? 0.92));
  return Math.round(clamped * 100);
}

class NodeOffscreenCanvas {
  private readonly canvas;
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.canvas = createCanvas(width, height);
    this.width = width;
    this.height = height;
  }

  getContext(type: '2d') {
    if (type !== '2d') {
      return null;
    }
    return this.canvas.getContext('2d');
  }

  async convertToBlob(options?: { type?: string; quality?: number }) {
    const format = options?.type ?? 'image/png';
    const quality = normalizeQuality(options?.quality);
    let buffer: Uint8Array;

    if (format === 'image/png') {
      buffer = await this.canvas.encode('png');
    } else if (format === 'image/jpeg') {
      buffer = await this.canvas.encode('jpeg', quality);
    } else if (format === 'image/webp') {
      buffer = await this.canvas.encode('webp', quality);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    return new Blob([buffer], { type: format });
  }
}

async function createBitmapFromBlob(blob: Blob): Promise<ImageBitmap> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const image = await loadImage(buffer);
  Object.assign(image, { close: () => undefined });
  return image as unknown as ImageBitmap;
}

export function registerCanvasPolyfill() {
  if (typeof globalThis.OffscreenCanvas === 'function' && typeof globalThis.createImageBitmap === 'function') {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).OffscreenCanvas = NodeOffscreenCanvas;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).createImageBitmap = (source: Blob) => createBitmapFromBlob(source);
}
