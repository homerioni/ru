'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import logo from '@/assets/img/logo.webp';
import { LINKS, ROUTES } from '@/constants/routes';
import { BurgerBtn } from '@ui/BurgerBtn';
import s from './styles.module.scss';
import { InstagramIcon, TelegramIcon } from '@ui/Icons';
import { SessionProvider, useSession } from 'next-auth/react';
import { LoginBtn } from '@/components/client/LoginBtn';
import { getClub } from '@/services';
import { Club } from '@prisma/client';

export const Header = () => (
  <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
    <HeaderContent />
  </SessionProvider>
);

export const HeaderContent = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [thisClub, setThisClub] = useState<Club | null>(null);

  const { data, status } = useSession();
  const pathname = usePathname();
  const params = useParams();

  const isPlayerPage =
    pathname === '/player' || pathname.startsWith('/player/');
  const isClubPage = pathname.startsWith('/club/');

  useEffect(() => {
    if (isClubPage && params.clubId) {
      getClub(params.clubId as string).then((res) => setThisClub(res));
    } else {
      setThisClub(null);
    }
  }, [params.clubId, isClubPage]);

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
        {!isPlayerPage && (
          <div className={s.logo}>
            {isClubPage ? (
              thisClub?.logoSrc && (
                <Image
                  className={s.otherLogo}
                  src={thisClub.logoSrc}
                  alt={'Логотип Речичане United'}
                  width={256}
                  height={256}
                />
              )
            ) : (
              <Image
                src={logo}
                alt={'Логотип Речичане United'}
                width={256}
                height={256}
              />
            )}
          </div>
        )}
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
          <li className={`${s.menuItem} ${s.mobile}`}>
            <Link
              href={LINKS.telegram}
              onClick={() => setMenuIsOpen(false)}
              target="_blank"
            >
              <TelegramIcon />
              Telegram
            </Link>
          </li>
          <li className={`${s.menuItem} ${s.mobile}`}>
            <Link
              href={LINKS.instagram}
              onClick={() => setMenuIsOpen(false)}
              target="_blank"
            >
              <InstagramIcon />
              Instagram
            </Link>
          </li>
        </ul>
        <div className={s.menuBg} onClick={() => setMenuIsOpen(false)} />
      </nav>
      <div className={s.socials}>
        <Link
          href={LINKS.telegram}
          className={`${s.socialLink} ${s.desktop}`}
          target="_blank"
        >
          <TelegramIcon />
        </Link>
        <Link
          href={LINKS.instagram}
          className={`${s.socialLink} ${s.desktop}`}
          target="_blank"
        >
          <InstagramIcon />
        </Link>
        <LoginBtn status={status} />
      </div>
    </header>
  );
};
