export type ProcessStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export type ExportFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ExportSettings {
  targetWidth: number;
  targetHeight: number;
  keepAspectRatio: boolean;
  autoOrientation: boolean;
  format: ExportFormat;
  quality: number;
}

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  crop: { x: number; y: number };
  zoom: number;
  cropArea: CropSettings | null;
  status: ProcessStatus;
  error?: string;
  createdAt: number;
}

export interface PresetOption {
  id: string;
  label: string;
  description: string;
  width: number;
  height: number;
  keepAspectRatio?: boolean;
  autoOrientation?: boolean;
}

export interface PresetGroup {
  id: string;
  label: string;
  options: PresetOption[];
}
