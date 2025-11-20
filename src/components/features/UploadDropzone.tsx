'use client';

import { Inbox, UploadCloud } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useImageStore } from '@/store/use-image-store';

export function UploadDropzone() {
  const addImages = useImageStore((state) => state.addImages);
  const markDragging = useImageStore((state) => state.markDragging);
  const imagesCount = useImageStore((state) => state.images.length);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      void addImages(acceptedFiles);
    },
    [addImages]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    noClick: true,
    onDrop,
    onDragEnter: () => markDragging(true),
    onDragLeave: () => markDragging(false),
    onDropAccepted: () => markDragging(false),
    onDropRejected: () => markDragging(false)
  });

  return (
    <div
      {...getRootProps({
        className:
          'group relative flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/40 px-6 py-10 text-center transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      })}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isDragActive ? <UploadCloud className="h-7 w-7" /> : <Inbox className="h-7 w-7" />}
        </div>
        <div>
          <p className="text-lg font-semibold">画像をドロップするか、ファイルを選択してください</p>
          <p className="text-sm text-muted-foreground">
            JPG / PNG / WebP に対応・1バッチ最大10ファイルまで
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={open}>
            ファイルを選択
          </Button>
          <Badge variant="outline">キュー: {imagesCount}件</Badge>
        </div>
      </div>
    </div>
  );
}
