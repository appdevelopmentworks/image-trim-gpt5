import { Sparkles } from 'lucide-react';

import { ThemeToggle } from '@/components/features/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card/40 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold">画像リサイズツール</p>
          <p className="text-xs text-muted-foreground">フェーズ1・UI整備中</p>
        </div>
        <Badge variant="outline" className="ml-2">
          MVP
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="hidden text-sm font-medium sm:inline-flex">
          フィードバックを送る
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
