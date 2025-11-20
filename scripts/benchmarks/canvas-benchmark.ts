#!/usr/bin/env tsx

import { createCanvas } from '@napi-rs/canvas';

import { processImage } from '../../src/lib/image-process';
import { registerCanvasPolyfill } from '../../tests/utils/canvas-polyfill';

registerCanvasPolyfill();

const BATCH_SIZE = Number(process.env.CANVAS_BENCH_BATCH ?? '10');
const TARGET_WIDTH = Number(process.env.CANVAS_BENCH_TARGET_WIDTH ?? '1024');
const TARGET_HEIGHT = Number(process.env.CANVAS_BENCH_TARGET_HEIGHT ?? '1024');

async function createFixtureFile(name: string, width: number, height: number) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(1, '#54a0ff');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#1dd1a1';
  ctx.fillRect(width / 3, height / 3, width / 2, height / 2);

  const buffer = await canvas.encode('png');
  return new File([buffer], name, { type: 'image/png' });
}

async function runBenchmark() {
  console.log('🧪 Canvas Benchmark');
  console.log(`- Batch size: ${BATCH_SIZE}`);
  console.log(`- Target size: ${TARGET_WIDTH}x${TARGET_HEIGHT}`);

  const fixtures = await Promise.all(
    Array.from({ length: BATCH_SIZE }, (_, index) =>
      createFixtureFile(`bench-${index}.png`, 1800, 1200)
    )
  );

  const durations: number[] = [];
  const startedAt = performance.now();
  for (const [index, file] of fixtures.entries()) {
    const taskStart = performance.now();
    await processImage({
      file,
      targetWidth: TARGET_WIDTH,
      targetHeight: TARGET_HEIGHT,
      format: 'image/jpeg',
      quality: 0.85,
      crop: null
    });
    const taskDuration = performance.now() - taskStart;
    durations.push(taskDuration);
    console.log(`  • Image ${index + 1}/${BATCH_SIZE}: ${taskDuration.toFixed(1)} ms`);
  }
  const total = performance.now() - startedAt;
  const average = durations.reduce((sum, value) => sum + value, 0) / durations.length;

  console.log('\nSummary');
  console.log(`- Total time: ${(total / 1000).toFixed(2)} s`);
  console.log(`- Average/image: ${average.toFixed(1)} ms`);
  console.log(`- KPI met (<=30s): ${total < 30_000 ? '✅' : '⚠️'}`);
}

runBenchmark().catch((error) => {
  console.error('Benchmark failed:', error);
  process.exitCode = 1;
});
