import { Header } from '@/components/client/Header';
import 'swiper/css';
import '../globals.css';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
