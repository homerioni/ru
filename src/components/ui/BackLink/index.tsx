import Link from 'next/link';
import s from './styles.module.scss';

export const BackLink = ({ href }: { href: string }) => (
  <Link className={s.main} href={href}>
    <svg viewBox="0 0 32 32" fill="var(--text-primary)">
      <path d="M13,26a1,1,0,0,1-.71-.29l-9-9a1,1,0,0,1,0-1.42l9-9a1,1,0,1,1,1.42,1.42L5.41,16l8.3,8.29a1,1,0,0,1,0,1.42A1,1,0,0,1,13,26Z" />
      <path d="M28,17H4a1,1,0,0,1,0-2H28a1,1,0,0,1,0,2Z" />
    </svg>
    <span>Назад</span>
  </Link>
);
