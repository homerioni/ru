import s from './styles.module.scss';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
};

export const Button = ({
  variant = 'primary',
  type = 'button',
  onClick,
  className,
  children,
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      className={`${s.main} ${className} ${s[variant]}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
