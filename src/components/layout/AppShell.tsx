import { ImageGrid } from '@/components/features/ImageGrid';
import { SettingsPanel } from '@/components/features/SettingsPanel';
import { StatusSummary } from '@/components/features/StatusSummary';
import { UploadDropzone } from '@/components/features/UploadDropzone';

import { AppHeader } from './AppHeader';

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        <aside className="w-full lg:w-[380px] xl:w-[440px]">
          <SettingsPanel />
        </aside>
        <section className="flex flex-1 flex-col gap-6">
          <UploadDropzone />
          <StatusSummary />
          <ImageGrid />
        </section>
      </div>
    </div>
  );
}
