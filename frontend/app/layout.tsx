import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/app/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Termly | Contract & Vendor Lifecycle Management',
  description: 'AI-powered contract management for modern businesses. Track obligations, get deadline alerts, and view spend analytics.',
  keywords: 'contract management, vendor management, CLM, SaaS, obligations, renewals',
  openGraph: {
    title: 'Termly',
    description: 'AI-powered contract and vendor lifecycle management',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
