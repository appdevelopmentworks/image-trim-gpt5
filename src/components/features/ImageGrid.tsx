'use client';

import { ImageIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { useImageStore } from '@/store/use-image-store';

import { ImageCard } from './ImageCard';

export function ImageGrid() {
  const images = useImageStore((state) => state.images);

  if (!images.length) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center text-muted-foreground">
        <ImageIcon className="h-8 w-8" />
        <p>画像をアップロードすると、トリミングや処理状況を確認できます。</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {images.map((image) => (
        <ImageCard key={image.id} image={image} />
      ))}
    </div>
  );
}
