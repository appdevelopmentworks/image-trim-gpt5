import { createCanvas, loadImage } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';

import { createCropPreviewBlob, processImage } from '@/lib/image-process';

const BASE_WIDTH = 1600;
const BASE_HEIGHT = 900;

async function createFixtureFile(name: string, width = BASE_WIDTH, height = BASE_HEIGHT) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(1, '#5f27cd');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#1dd1a1';
  ctx.fillRect(width / 2, 0, width / 2, height);

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
      quality: 0.9,
      keepAspectRatio: false
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

  it('fits output into the target box while preserving aspect ratio when enabled', async () => {
    const file = await createFixtureFile('fit.png');
    const blob = await processImage({
      file,
      targetWidth: 800,
      targetHeight: 800,
      format: 'image/jpeg',
      quality: 0.85,
      keepAspectRatio: true
    });

    const { width, height } = await decodeDimensions(blob);
    expect(width).toBe(800);
    expect(height).toBe(450);
  });

  it('auto-orients target size based on source aspect', async () => {
    const file = await createFixtureFile('portrait.png', 900, 1600);
    const blob = await processImage({
      file,
      targetWidth: 1200,
      targetHeight: 800,
      format: 'image/jpeg',
      quality: 0.8,
      keepAspectRatio: true,
      autoOrient: true
    });

    const { width, height } = await decodeDimensions(blob);
    expect(width).toBe(675);
    expect(height).toBe(1200);
  });
});

describe('createCropPreviewBlob', () => {
  it('generates a cropped thumbnail within the max size', async () => {
    const file = await createFixtureFile('preview.png');
    const blob = await createCropPreviewBlob({
      file,
      crop: {
        x: BASE_WIDTH / 2,
        y: 0,
        width: BASE_WIDTH / 2,
        height: BASE_HEIGHT,
        zoom: 1
      },
      maxSize: 160
    });

    const { width, height } = await decodeDimensions(blob);
    expect(width).toBeLessThanOrEqual(160);
    expect(height).toBeLessThanOrEqual(160);

    const pixel = await samplePixel(blob, { x: Math.floor(width / 2), y: Math.floor(height / 2) });
    expect(pixel.g).toBeGreaterThan(pixel.r);
    expect(pixel.g).toBeGreaterThan(pixel.b);
  });
});
