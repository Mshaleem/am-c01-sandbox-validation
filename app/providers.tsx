'use client';

import '@/lib/shadow-dom-patch';
import { useEffect, useState } from 'react';
import { ModusWcThemeProvider } from '@trimble-oss/moduswebcomponents-react';
import { setAssetPath } from '@trimble-oss/moduswebcomponents/components';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    setAssetPath(`${window.location.origin}${base}/`);
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return <SsrShellSkeleton />;
  }

  return <ModusWcThemeProvider>{children}</ModusWcThemeProvider>;
}

function SsrShellSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-dvh min-h-0 flex-col overflow-hidden bg-(--modus-wc-color-base-page)"
    >
      <div className="h-14 w-full shrink-0 border-b border-(--modus-wc-color-base-200) bg-(--modus-wc-color-base-100)" />
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-16 shrink-0 border-r border-(--modus-wc-color-base-200) bg-(--modus-wc-color-base-100) lg:block" />
        <div className="min-h-0 min-w-0 flex-1" />
      </div>
    </div>
  );
}
