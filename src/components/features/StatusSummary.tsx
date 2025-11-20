'use client';

import { Activity, CheckCircle2, Clock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { useImageStore } from '@/store/use-image-store';

export function StatusSummary() {
  const images = useImageStore((state) => state.images);

  const ready = images.length;
  const processing = images.filter((image) => image.status === 'processing').length;
  const completed = images.filter((image) => image.status === 'completed').length;

  const stats = [
    { label: '待機', value: ready, icon: Clock, accent: 'text-amber-400' },
    { label: '処理中', value: processing, icon: Activity, accent: 'text-sky-400' },
    { label: '完了', value: completed, icon: CheckCircle2, accent: 'text-emerald-400' }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card/60">
          <CardContent className="flex items-center gap-4 pt-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 ${stat.accent}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
