'use client';

import { create } from 'zustand';

import type { CropSettings, ExportSettings, ImageItem, ProcessStatus } from '@/lib/types';

const defaultSettings: ExportSettings = {
  targetWidth: 1080,
  targetHeight: 1080,
  keepAspectRatio: true,
  format: 'image/jpeg',
  quality: 0.92
};

type ImageStore = {
  images: ImageItem[];
  globalSettings: ExportSettings;
  isDragging: boolean;
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearImages: () => void;
  updateGlobalSettings: (settings: Partial<ExportSettings>) => void;
  updateImageStatus: (id: string, status: ProcessStatus, error?: string) => void;
  applyCropSettings: (
    id: string,
    payload: { crop: { x: number; y: number }; zoom: number; area: CropSettings | null }
  ) => void;
  markDragging: (value: boolean) => void;
};

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],
  globalSettings: defaultSettings,
  isDragging: false,
  addImages: async (files) => {
    const normalized = files.filter((file) => file.type.startsWith('image/'));
    if (!normalized.length) {
      return;
    }

    const enriched = await Promise.all(
      normalized.map(async (file) => {
        const previewUrl = URL.createObjectURL(file);
        const metadata = await readImageDimensions(file);
        return {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          originalWidth: metadata.width,
          originalHeight: metadata.height,
          crop: { x: 0, y: 0 },
          zoom: 1,
          cropArea: null,
          status: 'idle' as ProcessStatus,
          createdAt: Date.now()
        } satisfies ImageItem;
      })
    );

    set((state) => ({
      images: [...state.images, ...enriched]
    }));
  },
  removeImage: (id) =>
    set((state) => {
      const target = state.images.find((image) => image.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return {
        images: state.images.filter((image) => image.id !== id)
      };
    }),
  clearImages: () =>
    set((state) => {
      state.images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return { images: [] };
    }),
  updateGlobalSettings: (settings) =>
    set((state) => ({
      globalSettings: { ...state.globalSettings, ...settings }
    })),
  updateImageStatus: (id, status, error) =>
    set((state) => ({
      images: state.images.map((image) =>
        image.id === id
          ? { ...image, status, error: status === 'error' ? error : undefined }
          : image
      )
    })),
  applyCropSettings: (id, payload) =>
    set((state) => ({
      images: state.images.map((image) =>
        image.id === id
          ? {
              ...image,
              crop: payload.crop,
              zoom: payload.zoom,
              cropArea: payload.area
            }
          : image
      )
    })),
  markDragging: (value) => set({ isDragging: value })
}));

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  try {
    const dataUrl = await fileToDataURL(file);
    return await loadImage(dataUrl);
  } catch (error) {
    console.warn('Failed to read image metadata', error);
    return { width: 0, height: 0 };
  }
}

function fileToDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = reject;
    image.src = src;
  });
}
