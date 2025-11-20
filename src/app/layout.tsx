import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/providers/theme-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'クリエイター向け画像リサイズ',
  description: '複数の画像を一括でリサイズ・トリミングできるデスクトップ/WEBツールです。'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
