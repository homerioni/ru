import s from './styles.module.scss';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
};

export const Button = ({
  variant = 'primary',
  type = 'button',
  onClick,
  className,
  children,
}: ButtonProps) => {
  return (
    <button
      className={`${s.main} ${className} ${s[variant]}`}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
