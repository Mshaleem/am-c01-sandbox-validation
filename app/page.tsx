'use client';

import { useRouter } from 'next/navigation';
import {
  ModusWcButton,
  ModusWcCard,
  ModusWcIcon,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import { ORG_NAME, PROJECT_NAME } from '@/components/app-shell';
import { PresentationNav } from '@/components/presentation-nav';
import { PHASE_NAV_ITEMS } from '@/lib/phase-nav';

const PHASE_CARDS = [
  {
    href: '/spec-alignment',
    icon: 'settings',
    title: '2. AM-A02: Spec Alignment',
    body: 'Bind CSI MasterFormat sections to ALCS asset classes so staged equipment inherits the governed schema.',
    action: 'Open spec alignment',
  },
  {
    href: '/submittal-relation',
    icon: 'file_type_pdf',
    title: '3. AM-B02: Submittal Relation',
    body: 'Auto-relate SUB-042 to staged hydronic pumps and enrich missing manufacturer, model, and performance attributes.',
    action: 'Open submittal relation',
  },
  {
    href: '/sandbox-validation',
    icon: 'shield',
    title: '4. AM-C01: Sandbox Validation',
    body: 'Review blocker and warning errors in the sandbox queue, apply corrections, and authorize the F-06 handover push.',
    action: 'Open validation sandbox',
  },
] as const;

export default function ProjectSetupPage() {
  const router = useRouter();

  return (
    <div className="page-section">
      <PresentationNav />
      <section className="page-section">
        <div className="min-w-0">
          <ModusWcTypography hierarchy="h1" size="2xl" weight="semibold" label="1. Project Setup" />
          <ModusWcTypography
            hierarchy="p"
            size="md"
            customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={`${ORG_NAME} · ${PROJECT_NAME}. Walk the Phase 1 lifecycle from spec alignment through sandbox validation.`}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {PHASE_CARDS.map((card) => (
          <div key={card.href} className="min-w-0">
            <ModusWcCard bordered={true} padding="comfortable">
              <div slot="title" className="flex w-full min-w-0 items-center justify-start gap-2">
                <ModusWcIcon name={card.icon} decorative />
                <ModusWcTypography hierarchy="h2" size="md" weight="semibold" label={card.title} />
              </div>
              <ModusWcTypography hierarchy="p" size="md" label={card.body} />
              <div
                slot="footer"
                className="flex justify-end px-[var(--modus-wc-spacing-md)] pt-[var(--modus-wc-spacing-md)] pb-[var(--modus-wc-spacing-md)]"
              >
                <ModusWcButton
                  variant="filled"
                  color="primary"
                  size="sm"
                  onButtonClick={() => router.push(card.href)}
                >
                  <ModusWcIcon name={card.icon} size="xs" decorative />
                  {card.action}
                </ModusWcButton>
              </div>
            </ModusWcCard>
          </div>
        ))}
        <div className="min-w-0">
          <ModusWcCard bordered={true} padding="comfortable">
            <div slot="title" className="flex w-full min-w-0 items-center justify-start gap-2">
              <ModusWcIcon name="info" decorative />
              <ModusWcTypography hierarchy="h2" size="md" weight="semibold" label="Trimble Identity" />
            </div>
            <ModusWcTypography
              hierarchy="p"
              size="md"
              label="Signed in as Alex Rivera (alex.rivera@trimble.com)."
            />
            <ModusWcTypography
              hierarchy="p"
              size="sm"
              customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
              label={`${PHASE_NAV_ITEMS.length} Phase 1 screens stay available from the side navigation and the in-page lifecycle bar.`}
            />
          </ModusWcCard>
        </div>
      </div>
    </div>
  );
}
