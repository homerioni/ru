import s from './styles.module.scss';

type TTableTabsProps = {
  items: { id: number; name: string }[];
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
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setter(item.id)}
          className={`${s.tab} ${activeTab === item.id ? s.active : ''}`}
        >
          {item.name}
        </button>
      ))}
    </section>
  );
};
