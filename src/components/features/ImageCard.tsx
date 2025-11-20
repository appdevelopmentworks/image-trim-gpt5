'use client';

import 'react-easy-crop/react-easy-crop.css';

import { AlertTriangle, CheckCircle2, Crop, Loader2, Scissors, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

import type { CropSettings, ImageItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useImageStore } from '@/store/use-image-store';

type Props = {
  image: ImageItem;
};

export function ImageCard({ image }: Props) {
  const removeImage = useImageStore((state) => state.removeImage);
  const applyCropSettings = useImageStore((state) => state.applyCropSettings);
  const globalSettings = useImageStore((state) => state.globalSettings);

  const [isCropMode, setIsCropMode] = useState(false);
  const [localCrop, setLocalCrop] = useState(image.crop);
  const [localZoom, setLocalZoom] = useState(image.zoom);
  const [localArea, setLocalArea] = useState<Area | null>(toArea(image.cropArea));

  useEffect(() => {
    if (isCropMode) return;
    setLocalCrop(image.crop);
    setLocalZoom(image.zoom);
    setLocalArea(toArea(image.cropArea));
  }, [image.crop, image.cropArea, image.zoom, isCropMode]);

  const aspectRatio = useMemo(() => {
    if (!globalSettings.keepAspectRatio) return undefined;
    if (!globalSettings.targetHeight) return 1;
    return Number((globalSettings.targetWidth / globalSettings.targetHeight).toFixed(4));
  }, [globalSettings.keepAspectRatio, globalSettings.targetHeight, globalSettings.targetWidth]);

  const handleCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setLocalArea(croppedAreaPixels);
  }, []);

  const handleSaveCrop = () => {
    applyCropSettings(image.id, {
      crop: localCrop,
      zoom: localZoom,
      area: localArea ? fromArea(localArea, localZoom) : null
    });
    setIsCropMode(false);
  };

  const handleCancelCrop = () => {
    setLocalCrop(image.crop);
    setLocalZoom(image.zoom);
    setLocalArea(toArea(image.cropArea));
    setIsCropMode(false);
  };

  const handleResetCrop = () => {
    setLocalCrop({ x: 0, y: 0 });
    setLocalZoom(1);
    setLocalArea(null);
  };

  const statusConfig: Record<
    ImageItem['status'],
    { label: string; icon: ReactNode; variant: React.ComponentProps<typeof Badge>['variant'] }
  > = {
    idle: { label: '待機中', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, variant: 'outline' },
    processing: { label: '処理中', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, variant: 'warning' },
    completed: { label: '出力済み', icon: <CheckCircle2 className="h-3.5 w-3.5" />, variant: 'success' },
    error: { label: 'エラー', icon: <AlertTriangle className="h-3.5 w-3.5" />, variant: 'outline' }
  };

  const readableSize = formatBytes(image.file.size);
  const hasCrop = Boolean(image.cropArea);

  return (
    <Card className="relative overflow-hidden">
      {isCropMode && (
        <div className="absolute inset-0 z-10 flex flex-col gap-4 bg-background/95 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>トリミングプレビュー</span>
            {aspectRatio ? (
              <span>
                ターゲット比: {globalSettings.targetWidth}:{globalSettings.targetHeight}
              </span>
            ) : (
              <span>自由トリミング</span>
            )}
          </div>
          <div className="relative h-56 w-full overflow-hidden rounded-xl bg-black/80">
            <Cropper
              image={image.previewUrl}
              crop={localCrop}
              zoom={localZoom}
              aspect={aspectRatio}
              onCropChange={setLocalCrop}
              onZoomChange={setLocalZoom}
              onCropComplete={handleCropComplete}
              objectFit="contain"
              restrictPosition={false}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>ズーム</span>
              <span>{Math.round(localZoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={localZoom}
              onChange={(event) => setLocalZoom(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={handleCancelCrop}>
              キャンセル
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleResetCrop}>
                リセット
              </Button>
              <Button type="button" onClick={handleSaveCrop}>
                トリミングを保存
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <img src={image.previewUrl} alt={image.file.name} className="h-56 w-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-3 text-xs text-white">
          <div className="flex flex-col">
            <span className="font-medium">{image.file.name}</span>
            <span className="text-[10px] text-white/80">
              {image.originalWidth} x {image.originalHeight}px / {readableSize}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => removeImage(image.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between">
          <Badge variant={statusConfig[image.status].variant} className="gap-1">
            {statusConfig[image.status].icon}
            {statusConfig[image.status].label}
          </Badge>
          <p className="text-xs text-muted-foreground">
            追加:{' '}
            {new Date(image.createdAt).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Crop className="h-3.5 w-3.5" />
            <span>{hasCrop ? 'トリミング済み' : '未トリミング'}</span>
          </div>
          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setIsCropMode(true)}>
            <Scissors className="h-3.5 w-3.5" />
            調整する
          </Button>
        </div>
      </div>
    </Card>
  );
}

function toArea(area: CropSettings | null): Area | null {
  if (!area) return null;
  const { x, y, width, height } = area;
  return { x, y, width, height };
}

function fromArea(area: Area, zoom: number): CropSettings {
  return { ...area, zoom };
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(1)} ${units[exponent]}`;
}
