import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Toasts from '@/components/Toasts';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VerifiedMeasure | Real Estate Intelligence',
  description: 'Structured property intelligence with entitlement control',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toasts />
      </body>
    </html>
  );
}
