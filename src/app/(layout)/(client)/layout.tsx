import { Suspense } from 'react';
import { Header } from '@/components/client/Header';
import { Footer } from '@/components/client/Footer';
import { DogGaz } from '@/components/client/DogGaz';
import 'swiper/css';
import '../../globals.css';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main style={{ position: 'relative' }}>
        {children}
        <DogGaz />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}
