import type { Metadata, Viewport } from 'next';
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
      <body className={`${oswaldSans.variable} ${rubikFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
