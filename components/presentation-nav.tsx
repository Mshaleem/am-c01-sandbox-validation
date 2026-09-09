'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ModusWcButton } from '@trimble-oss/moduswebcomponents-react';
import { isPhaseNavActive, PHASE_NAV_ITEMS } from '@/lib/phase-nav';

export function PresentationNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 py-3 md:flex-row md:flex-wrap md:items-center" aria-label="Phase 1 lifecycle">
      {PHASE_NAV_ITEMS.map((item) => {
        const current = isPhaseNavActive(pathname, item.href);
        return (
          <ModusWcButton
            key={item.href}
            variant={current ? 'filled' : 'outlined'}
            color={current ? 'primary' : 'tertiary'}
            size="sm"
            aria-current={current ? 'page' : undefined}
            onButtonClick={() => router.push(item.href)}
          >
            {item.label}
          </ModusWcButton>
        );
      })}
    </nav>
  );
}
