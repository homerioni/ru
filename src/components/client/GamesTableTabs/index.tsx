import s from './styles.module.scss';

type TTableTabsProps = {
  items: { id: number; name: string }[];
  activeTab: number;
  setter: (value: number) => void;
  className?: string;
};

export const GamesTableTabs = ({
  items,
  activeTab,
  setter,
  className,
}: TTableTabsProps) => {
  return (
    <section className={`${s.main} ${className ?? ''}`}>
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
