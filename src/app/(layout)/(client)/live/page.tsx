import { LiveRoom } from '@/components/client/LiveRoom';
import { getActiveBroadcast } from '@/lib/broadcast';
import s from './styles.module.scss';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Трансляция | Речичане United',
  description: 'Прямой эфир и общий чат болельщиков Речичане United',
};

export default async function LivePage() {
  const broadcast = await getActiveBroadcast();

  if (!broadcast) {
    return (
      <section className={s.empty}>
        <h1 className={s.emptyTitle}>Трансляции сейчас нет</h1>
        <p className={s.emptyText}>
          Когда начнётся эфир, страница появится в меню. Следите за анонсами в
          Telegram и Instagram.
        </p>
      </section>
    );
  }

  return <LiveRoom broadcast={broadcast} />;
}
