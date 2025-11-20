#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const rendererPort = process.env.PORT || '3000';
const rendererUrl = process.env.RENDERER_URL || `http://localhost:${rendererPort}`;

function createSpawnOptions() {
  return {
    stdio: 'inherit',
    shell: isWindows
  };
}

function getElectronBinary() {
  const binName = isWindows ? 'electron.cmd' : 'electron';
  const binPath = path.join(process.cwd(), 'node_modules', '.bin', binName);
  if (!existsSync(binPath)) {
    throw new Error(`Electron binary not found at ${binPath}. Did you run pnpm install?`);
  }
  return binPath;
}

async function waitForRenderer(url, retries = 30) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        return;
      }
    } catch (error) {
      // wait and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Renderer at ${url} did not respond after ${retries} seconds.`);
}

async function run() {
  console.log('[dev:desktop] Starting Next.js renderer...');
  const nextProcess = spawn('pnpm', ['dev:web'], createSpawnOptions());

  nextProcess.on('exit', (code) => {
    console.log(`[dev:desktop] Next.js process exited with code ${code ?? 0}`);
  });

  await waitForRenderer(rendererUrl);
  console.log(`[dev:desktop] Renderer ready at ${rendererUrl}`);

  const electronBinary = getElectronBinary();

  console.log('[dev:desktop] Launching Electron...');
  const electronProcess = spawn(electronBinary, [path.join('main', 'main.js')], {
    ...createSpawnOptions(),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      RENDERER_URL: rendererUrl
    }
  });

  const cleanup = () => {
    electronProcess?.kill();
    nextProcess?.kill();
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  electronProcess.on('exit', (code) => {
    console.log(`[dev:desktop] Electron exited with code ${code ?? 0}`);
    cleanup();
  });
}

run().catch((error) => {
  console.error('[dev:desktop] Failed to start desktop environment:', error);
  process.exitCode = 1;
});
