import type { Metadata, Viewport } from 'next';
import Head from 'next/head';
import { Oswald, Rubik } from 'next/font/google';
import '../assets/Circe/stylesheet.css';

const oswaldSans = Oswald({
  variable: '--fat-font',
  subsets: ['cyrillic', 'latin'],
});

const rubikFont = Rubik({
  variable: '--main-font',
  subsets: ['cyrillic', 'latin'],
});

export const metadata: Metadata = {
  title: 'Речичане United',
  description: 'Любительская футбольная команда города Речица',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logo512.png" />
        <meta property="og:title" content="Речичане United" />
        <meta
          property="og:description"
          content="Любительская футбольная команда города Речица"
        />
        <meta property="og:image" content="https://rechutd.ru/logo.png" />
        <meta property="og:url" content="https://rechutd.ru/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body className={`${oswaldSans.variable} ${rubikFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
