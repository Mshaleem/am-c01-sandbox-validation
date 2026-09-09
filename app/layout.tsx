import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { Providers } from './providers';
import { AppShell } from '@/components/app-shell';
import './globals.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'AM-C01 Sandbox validation',
  description:
    'Review and resolve sandbox validation errors before authorizing the ALCS handover push.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={openSans.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" />
        <link rel="stylesheet" href="/modus-web-components/modus-icons.css" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/npm/@trimble-oss/modus-icons@1/dist/modus-outlined/fonts/modus-icons.woff2"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/npm/@trimble-oss/modus-icons@1/dist/modus-solid/fonts/modus-icons.woff2"
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
