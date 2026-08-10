import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Preflop Trainer — 9-Max 100BB NLHE',
  description:
    'A professional preflop poker trainer for 9-Max No-Limit Texas Hold\'em. Study GTO strategy with unlimited dynamically generated quiz questions. Practice RFI, facing opens, and facing 3-bets.',
  keywords: ['poker', 'preflop', 'trainer', 'GTO', '9-max', 'NLHE', 'No-Limit Hold\'em'],
  openGraph: {
    title: 'Preflop Trainer',
    description: 'Study GTO preflop poker strategy with an interactive trainer',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      style={{ height: '100%' }}
    >
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
