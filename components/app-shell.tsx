'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ModusWcBreadcrumbs,
  ModusWcIcon,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcNavbar,
  ModusWcSideNavigation,
  ModusWcThemeSwitcher,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import { crumbForPath, isPhaseNavActive, PHASE_NAV_ITEMS } from '@/lib/phase-nav';
import { useMediaQuery } from '@/lib/useMediaQuery';

export const PUSH_LAYOUT_MIN_PX = 1024;
export const XL_MIN_PX = 1280;
export const SIDE_NAV_MAX_WIDTH = '256px';
export const SIDE_NAV_MIN_WIDTH = '4rem';

export const ORG_NAME = 'City of Riverside Public Works';
export const PROJECT_NAME = 'Water Treatment Plant Expansion';

function readExpandedDetail(detail: unknown): boolean {
  if (typeof detail === 'boolean') return detail;
  if (detail && typeof detail === 'object' && 'expanded' in detail) {
    return Boolean((detail as { expanded: unknown }).expanded);
  }
  return Boolean(detail);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isDesktop = useMediaQuery(`(min-width: ${PUSH_LAYOUT_MIN_PX}px)`);
  const isXl = useMediaQuery(`(min-width: ${XL_MIN_PX}px)`);
  const isWideNavbar = useMediaQuery('(min-width: 768px)');
  const [sideNavExpanded, setSideNavExpanded] = useState(isXl);
  const [navbarHeight, setNavbarHeight] = useState(56);
  const railWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSideNavExpanded(isXl);
  }, [isXl]);

  useEffect(() => {
    if (!isDesktop) {
      setSideNavExpanded(false);
    }
  }, [pathname, isDesktop]);

  useLayoutEffect(() => {
    const navbar = document.querySelector('.app-shell modus-wc-navbar');
    const apply = () => {
      if (navbar) setNavbarHeight(navbar.getBoundingClientRect().height || 56);
    };
    apply();
    if (!navbar) return undefined;
    const observer = new ResizeObserver(apply);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, [isWideNavbar]);

  useLayoutEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return undefined;

    if (!isDesktop) {
      main.style.removeProperty('margin-left');
      return undefined;
    }

    const next = sideNavExpanded ? SIDE_NAV_MAX_WIDTH : SIDE_NAV_MIN_WIDTH;
    main.style.marginLeft = next;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        main.style.marginLeft = next;
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [isDesktop, sideNavExpanded]);

  useLayoutEffect(() => {
    const wrapper = railWrapperRef.current;
    if (!wrapper) return;
    if (!isDesktop && !sideNavExpanded && wrapper.contains(document.activeElement)) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
  }, [isDesktop, sideNavExpanded]);

  useEffect(() => {
    const host = document.querySelector('.app-shell modus-wc-navbar') as
      | (HTMLElement & { mainMenuOpen?: boolean })
      | null;
    if (!host) return;
    const id = window.setTimeout(() => {
      host.mainMenuOpen = isDesktop ? false : sideNavExpanded;
    }, 0);
    return () => window.clearTimeout(id);
  }, [isDesktop, sideNavExpanded, pathname]);

  const mode = isDesktop ? 'push' : 'overlay';
  const overlayCollapsed = !isDesktop && !sideNavExpanded;
  const railWidth = overlayCollapsed
    ? '0px'
    : sideNavExpanded
      ? SIDE_NAV_MAX_WIDTH
      : SIDE_NAV_MIN_WIDTH;

  const visibility = {
    logo: true,
    mainMenu: true,
    apps: isWideNavbar,
    search: isWideNavbar,
    searchInput: false,
    notifications: isWideNavbar,
    help: isWideNavbar,
    user: true,
    ai: false,
  };

  const handleMainMenuOpenChange = (e: CustomEvent<boolean>) => {
    if (isDesktop) {
      setSideNavExpanded((prev) => !prev);
      return;
    }
    setSideNavExpanded(Boolean(e.detail));
  };

  return (
    <div className={`app-shell${sideNavExpanded && isDesktop ? ' app-shell-expanded' : ''}`}>
      <ModusWcNavbar
        condensed={!isWideNavbar}
        mainMenuOpen={isDesktop ? false : sideNavExpanded}
        onMainMenuOpenChange={handleMainMenuOpenChange}
        visibility={visibility}
        userCard={{
          name: 'Alex Rivera',
          email: 'alex.rivera@trimble.com',
        }}
        customClass="sticky top-0 z-[120] flex-shrink-0"
        onAppsClick={() => undefined}
        onSearchClick={() => undefined}
        onNotificationsClick={() => undefined}
        onHelpClick={() => undefined}
      >
        <div slot="start" className="hidden min-w-0 flex-col justify-center md:flex">
          <ModusWcTypography hierarchy="p" size="sm" weight="semibold" label={ORG_NAME} />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={PROJECT_NAME}
          />
        </div>
        <div
          slot="center"
          hidden={!isWideNavbar}
          className={
            isWideNavbar ? 'app-shell-navbar-center flex min-w-0 items-center gap-2' : 'app-shell-navbar-center'
          }
        >
          <ModusWcBreadcrumbs
            size="md"
            items={[
              { label: ORG_NAME },
              { label: PROJECT_NAME },
              { label: crumbForPath(pathname) },
            ]}
          />
        </div>
        <div slot="end" className="flex items-center gap-2">
          <ModusWcThemeSwitcher />
        </div>
      </ModusWcNavbar>

      <div className="app-body-row">
        <div
          ref={railWrapperRef}
          className={`side-rail-wrapper${overlayCollapsed ? ' is-overlay-collapsed' : ''}`}
          inert={overlayCollapsed ? true : undefined}
          style={{
            '--app-navbar-height': `${navbarHeight}px`,
            '--app-rail-width': railWidth,
          } as React.CSSProperties}
        >
          <ModusWcSideNavigation
            key={mode}
            expanded={sideNavExpanded}
            mode={mode}
            maxWidth={SIDE_NAV_MAX_WIDTH}
            targetContent="#main-content"
            collapseOnClickOutside={!isDesktop}
            onExpandedChange={(e: CustomEvent<boolean>) =>
              setSideNavExpanded(readExpandedDetail(e.detail))
            }
          >
            <ModusWcMenu size="md" customClass="w-full">
              {PHASE_NAV_ITEMS.map((item) => (
                <ModusWcMenuItem
                  key={item.id}
                  label={item.label}
                  value={item.id}
                  selected={isPhaseNavActive(pathname, item.href)}
                  onItemSelect={() => router.push(item.href)}
                >
                  <ModusWcIcon slot="start-icon" name={item.icon} size="md" decorative />
                </ModusWcMenuItem>
              ))}
            </ModusWcMenu>
          </ModusWcSideNavigation>
        </div>

        <main id="main-content" tabIndex={-1} className="bg-(--modus-wc-color-base-page)">
          <div className="page-main mx-auto w-full min-w-0 max-w-7xl px-4 py-6 md:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
