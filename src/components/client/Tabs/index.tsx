import s from './styles.module.scss';

type TTabsProps = {
  items: { id: number; name: string }[];
  activeTab: number;
  setter: (value: number) => void;
  className?: string;
  notContainer?: boolean;
};

export const Tabs = ({
  items,
  activeTab,
  setter,
  className,
  notContainer,
}: TTabsProps) => {
  return (
    <div
      className={`${s.main} ${className ?? ''} ${notContainer ? s.notContainer : ''}`}
    >
      <div className={s.wrapper}>
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
      </div>
    </div>
  );
};
