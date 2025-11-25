import { downloadBlob } from './utils';

type DesktopSaveResponse = { canceled?: boolean; filePath?: string | null };

type DesktopAPI = {
  saveFile: (payload: { buffer: ArrayBuffer; filename: string }) => Promise<DesktopSaveResponse>;
};

declare global {
  interface Window {
    desktopAPI?: DesktopAPI;
  }
}

function getDesktopAPI(): DesktopAPI | null {
  if (typeof window === 'undefined') return null;
  return window.desktopAPI ?? null;
}

export async function saveBlobWithDesktopFallback(blob: Blob, filename: string) {
  const desktop = getDesktopAPI();
  if (!desktop) {
    downloadBlob(blob, filename);
    return { method: 'browser', canceled: false as const };
  }

  try {
    const buffer = await blob.arrayBuffer();
    const result = await desktop.saveFile({ buffer, filename });
    if (result?.canceled) {
      return { method: 'desktop', canceled: true as const };
    }
    return { method: 'desktop', canceled: false as const, filePath: result?.filePath ?? null };
  } catch (error) {
    console.error('Failed to save via desktop API, falling back to browser download', error);
    downloadBlob(blob, filename);
    return { method: 'browser', canceled: false as const, fallbackFromError: true as const };
  }
}
