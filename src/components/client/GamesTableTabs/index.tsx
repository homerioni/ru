import { MatchType } from '@prisma/client';
import s from './styles.module.scss';

type TTableTabsProps = {
  items: MatchType[];
  activeTab: number;
  setter: (value: number) => void;
};

export const GamesTableTabs = ({
  items,
  activeTab,
  setter,
}: TTableTabsProps) => {
  return (
    <section className={s.main}>
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setter(i)}
          className={`${s.tab} ${activeTab === i ? s.active : ''}`}
        >
          {item.name}
        </button>
      ))}
    </section>
  );
};
