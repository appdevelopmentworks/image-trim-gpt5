import { createCanvas, loadImage } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';

import { processImage } from '@/lib/image-process';

const BASE_WIDTH = 1600;
const BASE_HEIGHT = 900;

async function createFixtureFile(name: string) {
  const canvas = createCanvas(BASE_WIDTH, BASE_HEIGHT);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, BASE_WIDTH, BASE_HEIGHT);
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(1, '#5f27cd');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  ctx.fillStyle = '#1dd1a1';
  ctx.fillRect(BASE_WIDTH / 2, 0, BASE_WIDTH / 2, BASE_HEIGHT);

  const buffer = await canvas.encode('png');
  return new File([buffer], name, { type: 'image/png' });
}

async function decodeDimensions(blob: Blob) {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const image = await loadImage(buffer);
  return { width: image.width, height: image.height, image };
}

async function samplePixel(blob: Blob, coordinate: { x: number; y: number }) {
  const { image, width, height } = await decodeDimensions(blob);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(coordinate.x, coordinate.y, 1, 1).data;
  return { r: data[0], g: data[1], b: data[2] };
}

describe('processImage', () => {
  it('resizes an image to the requested dimensions', async () => {
    const file = await createFixtureFile('resize.png');
    const blob = await processImage({
      file,
      targetWidth: 800,
      targetHeight: 800,
      format: 'image/png',
      quality: 0.9
    });

    const { width, height } = await decodeDimensions(blob);
    expect(width).toBe(800);
    expect(height).toBe(800);
    expect(blob.type).toBe('image/png');
  });

  it('applies crop coordinates before resizing', async () => {
    const file = await createFixtureFile('crop.png');
    const blob = await processImage({
      file,
      targetWidth: 600,
      targetHeight: 600,
      format: 'image/png',
      quality: 0.95,
      crop: {
        x: BASE_WIDTH / 2,
        y: 0,
        width: BASE_WIDTH / 2,
        height: BASE_HEIGHT,
        zoom: 1
      }
    });

    const pixel = await samplePixel(blob, { x: 300, y: 300 });
    // Cropped右半分（#1dd1a1）が中心に描画されていることを確認
    expect(pixel.g).toBeGreaterThan(pixel.r);
    expect(pixel.g).toBeGreaterThan(pixel.b);
  });

  it('processes 10 images within the 30s KPI', async () => {
    const files = await Promise.all(
      Array.from({ length: 10 }, (_, index) => createFixtureFile(`bench-${index}.png`))
    );

    const startedAt = performance.now();
    for (const file of files) {
      await processImage({
        file,
        targetWidth: 1024,
        targetHeight: 1024,
        format: 'image/jpeg',
        quality: 0.85,
        crop: null
      });
    }
    const duration = performance.now() - startedAt;
    expect(duration).toBeLessThan(30_000);
  });
});
