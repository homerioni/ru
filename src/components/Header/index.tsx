'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import logo from '~assets/img/logo.svg';
import tg from '~assets/img/tg.svg';
import inst from '~assets/img/inst.svg';
import { LINKS, ROUTES } from '~constants/routes';
import s from './styles.module.scss';
import { BurgerBtn } from '~components/ui/BurgerBtn';

export const Header = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const onBurgerClick = () => setMenuIsOpen((prev) => !prev);

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
              <Link href={item.href}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={s.socials}>
        <Link href={LINKS.telegram} className={s.socialLink} target="_blank">
          <Image src={tg} alt="Telegram" />
        </Link>
        <Link href={LINKS.instagram} className={s.socialLink} target="_blank">
          <Image src={inst} alt="Instagram" />
        </Link>
      </div>
    </header>
  );
};
