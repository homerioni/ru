import s from './styles.module.scss';

type TBurgerBtnProps = {
  isActive: boolean;
  onClick: () => void;
  className?: string;
};

export const BurgerBtn = ({
  isActive,
  onClick,
  className,
}: TBurgerBtnProps) => {
  return (
    <button
      className={`${s.main} ${className ?? ''} ${isActive ? s.active : ''}`}
      type="button"
      onClick={onClick}
    >
      <span />
    </button>
  );
};
