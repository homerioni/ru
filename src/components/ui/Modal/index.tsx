import s from './styles.module.scss';

type ModalProps = {
  closeHandler: () => void;
  children: React.ReactNode;
  contentClassName?: string;
};

export const Modal = ({
  closeHandler,
  children,
  contentClassName,
}: ModalProps) => {
  return (
    <div className={s.main}>
      <div className={s.bg} onClick={closeHandler} />
      <div className={`${s.content} ${contentClassName}`}>
        <button type="button" className={s.closeBtn} onClick={closeHandler} />
        {children}
      </div>
    </div>
  );
};
