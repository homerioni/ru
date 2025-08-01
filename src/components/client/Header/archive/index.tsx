'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import logo from '@/assets/img/logo.webp';
import tg from '@/assets/img/tg.svg';
import inst from '@/assets/img/inst.svg';
import { LINKS, ROUTES } from '@/constants/routes';
import s from './styles.module.scss';
import { BurgerBtn } from '@ui/BurgerBtn';
import { SessionProvider, useSession } from 'next-auth/react';
import { LoginBtn } from '@/components/client/LoginBtn';
import { UserInfo } from '@/components/client/UserInfo';
import { useMediaQuery } from '@mantine/hooks';
import { Coins } from '@ui/Coins';

export const Header = () => (
  <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
    <HeaderContent />
  </SessionProvider>
);

export const HeaderContent = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { data, status } = useSession();

  const onBurgerClick = () => setMenuIsOpen((prev) => !prev);

  useEffect(() => {
    const body = document.getElementsByTagName('body')[0];

    if (menuIsOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  }, [menuIsOpen]);

  useEffect(() => {
    if (data?.user?.id) sessionStorage.setItem('userId', data.user.id);
  }, [data]);

  return (
    <header className={`${s.main} container`}>
      <BurgerBtn isActive={false} onClick={onBurgerClick} />
      <div className={s.logoBox}>
        <div className={s.logo}>
          <Image src={logo} alt={'Логотип Речичане United'} />
        </div>
      </div>
      <nav className={`${s.menu} ${menuIsOpen ? s.open : ''}`}>
        <BurgerBtn isActive onClick={onBurgerClick} className={s.burgerClose} />
        <ul className={s.menuList}>
          {Object.entries(ROUTES).map(([key, item]) => (
            <li key={key} className={s.menuItem}>
              <Link href={item.href} onClick={() => setMenuIsOpen(false)}>
                {item.name}
              </Link>
            </li>
          ))}
          {status === 'authenticated' && (
            <li className={s.menuItem}>
              <Link href="/tops" onClick={() => setMenuIsOpen(false)}>
                Лидеры ставок
              </Link>
            </li>
          )}
          <li className={`${s.menuItem} ${s.mobile}`}>
            <Link
              href={LINKS.telegram}
              onClick={() => setMenuIsOpen(false)}
              target="_blank"
            >
              <Image src={tg} alt="Telegram" />
              Telegram
            </Link>
          </li>
          <li className={`${s.menuItem} ${s.mobile}`}>
            <Link
              href={LINKS.instagram}
              onClick={() => setMenuIsOpen(false)}
              target="_blank"
            >
              <Image src={inst} alt="Instagram" />
              Instagram
            </Link>
          </li>
          <li className={`${s.menuItem} ${s.mobile} ${s.userMob}`}>
            {status === 'authenticated' && isMobile && (
              <UserInfo
                img={data?.user?.image ?? logo}
                name={data?.user?.name ?? 'Тестовый юзер'}
              />
            )}
            <LoginBtn status={status} isMobile />
          </li>
        </ul>
        <div className={s.menuBg} onClick={() => setMenuIsOpen(false)} />
      </nav>
      <div className={s.socials}>
        {status === 'unauthenticated' && (
          <>
            <Link
              href={LINKS.telegram}
              className={s.socialLink}
              target="_blank"
            >
              <Image src={tg} alt="Telegram" />
            </Link>
            <Link
              href={LINKS.instagram}
              className={s.socialLink}
              target="_blank"
            >
              <Image src={inst} alt="Instagram" />
            </Link>
          </>
        )}
        <div className={s.user}>
          {status === 'authenticated' && !isMobile && (
            <UserInfo
              img={data?.user?.image ?? ''}
              name={data?.user?.name ?? ''}
              points={data?.user?.points ?? 0}
            />
          )}
          {status === 'authenticated' && isMobile && (
            <Coins id="coins" qty={data?.user?.points ?? 0} />
          )}
        </div>
        <LoginBtn status={status} isDesktop />
      </div>
    </header>
  );
};
