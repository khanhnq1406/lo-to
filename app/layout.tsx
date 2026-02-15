/**
 * Root Layout - Vietnamese Lô Tô Game
 * Next.js app directory root layout with metadata and global providers
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SocketProvider } from '@/providers/SocketProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Lô Tô Việt Nam - Trò chơi truyền thống',
  description:
    'Trò chơi Lô Tô Việt Nam trực tuyến - Chơi với bạn bè trong Tết Nguyên Đán. Vietnamese Bingo game for Lunar New Year celebrations.',
  keywords: [
    'lô tô',
    'loto',
    'bingo',
    'vietnamese bingo',
    'tết',
    'lunar new year',
    'game',
    'multiplayer',
  ],
  authors: [{ name: 'Vietnamese Lô Tô Team' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    title: 'Lô Tô Việt Nam',
    description: 'Trò chơi Lô Tô Việt Nam trực tuyến',
    siteName: 'Lô Tô Việt Nam',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
