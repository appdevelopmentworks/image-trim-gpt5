import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ExportFormat } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EXPORT_EXTENSION: Record<ExportFormat, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildExportFilename(originalName: string, format: ExportFormat) {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '') || 'image';
  return `${nameWithoutExt}_trimmed.${EXPORT_EXTENSION[format]}`;
}

export function buildZipFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `images-${timestamp}.zip`;
}
