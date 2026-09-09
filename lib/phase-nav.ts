export const PHASE_NAV_ITEMS = [
  {
    id: 'setup',
    href: '/',
    label: '1. Project Setup',
    icon: 'home',
    crumb: 'Project setup',
  },
  {
    id: 'alignment',
    href: '/spec-alignment',
    label: '2. AM-A02: Spec Alignment',
    icon: 'settings',
    crumb: 'Spec alignment',
  },
  {
    id: 'relation',
    href: '/submittal-relation',
    label: '3. AM-B02: Submittal Relation',
    icon: 'file_type_pdf',
    crumb: 'Submittal relation',
  },
  {
    id: 'sandbox',
    href: '/sandbox-validation',
    label: '4. AM-C01: Sandbox Validation',
    icon: 'shield',
    crumb: 'Sandbox validation',
  },
] as const;

export function isPhaseNavActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(href);
}

export function crumbForPath(pathname: string): string {
  const match = PHASE_NAV_ITEMS.find((item) => isPhaseNavActive(pathname, item.href));
  return match?.crumb ?? 'Project setup';
}
