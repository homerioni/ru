import localFont from 'next/font/local';
import { KvasGame } from '@/components/client/KvasGame';

const pixelFont = localFont({
  src: '../../../../../public/game/kvas/font/CozetteVector.ttf',
  display: 'swap',
  fallback: ['monospace'],
  adjustFontFallback: false,
});

export const metadata = {
  title: 'Ясен Квасен: Раздевалка | Речичане United',
  description: 'Пиксельный кликер. Один клик — один глоток.',
};

export default function GamePage() {
  return <KvasGame fontClass={pixelFont.className} />;
}
