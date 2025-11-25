'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { Download, SlidersHorizontal, Trash2 } from 'lucide-react';

import { PRESET_GROUPS } from '@/constants/presets';
import { saveBlobWithDesktopFallback } from '@/lib/desktop-bridge';
import { processImage } from '@/lib/image-process';
import { buildExportFilename, buildZipFilename } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useImageStore } from '@/store/use-image-store';

type ProcessedFile = {
  filename: string;
  blob: Blob;
};

export function SettingsPanel() {
  const { globalSettings, updateGlobalSettings, clearImages, images } = useImageStore((state) => ({
    globalSettings: state.globalSettings,
    updateGlobalSettings: state.updateGlobalSettings,
    clearImages: state.clearImages,
    images: state.images
  }));
  const updateImageStatus = useImageStore((state) => state.updateImageStatus);
  const [isExporting, setIsExporting] = useState(false);

  const applyPreset = (width: number, height: number) => {
    updateGlobalSettings({ targetWidth: width, targetHeight: height });
  };

  const hasImages = images.length > 0;

  const handleExport = async () => {
    if (!hasImages || isExporting) {
      return;
    }

    setIsExporting(true);
    const processedFiles: ProcessedFile[] = [];

    try {
      for (const image of images) {
        updateImageStatus(image.id, 'processing');
        try {
          const blob = await processImage({
            file: image.file,
            targetWidth: globalSettings.targetWidth,
            targetHeight: globalSettings.targetHeight,
            format: globalSettings.format,
            quality: globalSettings.quality,
            autoOrient: globalSettings.autoOrientation,
            keepAspectRatio: globalSettings.keepAspectRatio,
            crop: image.cropArea
          });

          const filename = buildExportFilename(image.file.name, globalSettings.format);
          processedFiles.push({ blob, filename });
          updateImageStatus(image.id, 'completed');
        } catch (error) {
          console.error('Failed to process image', error);
          updateImageStatus(
            image.id,
            'error',
            error instanceof Error ? error.message : '不明なエラーが発生しました'
          );
        }
      }

      if (!processedFiles.length) {
        return;
      }

      if (processedFiles.length === 1) {
        const [file] = processedFiles;
        await saveBlobWithDesktopFallback(file.blob, file.filename);
        return;
      }

      const zip = new JSZip();
      processedFiles.forEach((file) => {
        zip.file(file.filename, file.blob);
      });

      const archive = await zip.generateAsync({ type: 'blob' });
      await saveBlobWithDesktopFallback(archive, buildZipFilename());
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-card/60">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            プリセット
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {PRESET_GROUPS.map((group) => (
            <div key={group.id} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
              <div className="grid grid-cols-2 gap-2">
                {group.options.map((option) => (
                  <Button
                    key={option.id}
                    type="button"
                    variant={
                      globalSettings.targetWidth === option.width &&
                      globalSettings.targetHeight === option.height
                        ? 'default'
                        : 'outline'
                    }
                    className="justify-start text-left"
                    onClick={() => applyPreset(option.width, option.height)}
                  >
                    <span className="text-sm">
                      {option.label}
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-sm font-semibold">出力設定</p>
            <p className="text-xs text-muted-foreground">キャンバスとファイル形式を指定します</p>
          </div>
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="width">幅 (px)</Label>
              <Input
                id="width"
                type="number"
                inputMode="numeric"
                value={globalSettings.targetWidth}
                min={1}
                onChange={(event) =>
                  updateGlobalSettings({ targetWidth: Number(event.target.value) })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="height">高さ (px)</Label>
              <Input
                id="height"
                type="number"
                inputMode="numeric"
                value={globalSettings.targetHeight}
                min={1}
                onChange={(event) =>
                  updateGlobalSettings({ targetHeight: Number(event.target.value) })
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={globalSettings.keepAspectRatio}
              onChange={(event) => updateGlobalSettings({ keepAspectRatio: event.target.checked })}
            />
            <div className="flex flex-col">
              <span className="font-medium">縦横比を自動調整</span>
              <span className="text-xs text-muted-foreground">
                元画像（またはクロップ領域）の縦横比を維持し、指定サイズ内にフィットさせます
              </span>
            </div>
          </label>

          <div className="space-y-1">
            <Label htmlFor="format">ファイル形式</Label>
            <Select
              id="format"
              value={globalSettings.format}
              onChange={(event) =>
                updateGlobalSettings({ format: event.target.value as typeof globalSettings.format })
              }
            >
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="quality">品質</Label>
              <span className="text-xs text-muted-foreground">
                {(globalSettings.quality * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="quality"
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={globalSettings.quality}
              onChange={(event) =>
                updateGlobalSettings({ quality: Number(event.target.value) })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={globalSettings.keepAspectRatio}
                onChange={(event) => updateGlobalSettings({ keepAspectRatio: event.target.checked })}
              />
              <div className="flex flex-col">
                <span className="font-medium">縦横比を維持してフィット</span>
                <span className="text-xs text-muted-foreground">
                  元画像（またはクロップ領域）の縦横比を保ったまま、指定サイズ内に収めます
                </span>
              </div>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={globalSettings.autoOrientation}
                onChange={(event) => updateGlobalSettings({ autoOrientation: event.target.checked })}
              />
              <div className="flex flex-col">
                <span className="font-medium">縦横を自動判別</span>
                <span className="text-xs text-muted-foreground">
                  縦長の画像は高さ優先、横長は幅優先で、出力幅/高さを自動で入れ替えます
                </span>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="flex flex-col gap-3 pt-4">
          <Button type="button" variant="outline" onClick={clearImages} disabled={!hasImages || isExporting}>
            <Trash2 className="mr-2 h-4 w-4" />
            キューをクリア
          </Button>
          <Button type="button" onClick={handleExport} disabled={!hasImages || isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? '書き出し中…' : 'ZIPでまとめて出力'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            1件の場合は個別ファイルを、2件以上はZIPアーカイブで保存します
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
