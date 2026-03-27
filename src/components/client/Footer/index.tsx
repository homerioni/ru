'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ModalContact } from '@/components/client/modals/ModalContact';
import s from './styles.module.scss';
import { useSearchParams } from 'next/navigation';
import { TelegramIcon } from '@ui/Icons';

export const Footer = () => {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const body = document.getElementsByTagName('body')[0];

    if (isModalOpen) {
      body.style.width = `${body.offsetWidth}px`;
      body.style.overflow = 'hidden';
    } else {
      body.style.width = '';
      body.style.overflow = '';
    }
  }, [isModalOpen]);

  useEffect(() => {
    const modalParam = searchParams.get('modal');

    if (modalParam === 'open') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      <footer className={s.main}>
        <div className="container">
          <div className={s.developer}>
            Разработчик:{' '}
            <Link href="https://t.me/homerion" target="_blank">
              <TelegramIcon />
              Артём Горбаль
            </Link>
          </div>
          {/*<div className={s.contact}>*/}
          {/*  <p>*/}
          {/*    Хочешь играть в командах лиги или добавить свою команду?*/}
          {/*    <br /> Оставь заявку — мы с тобой свяжемся.*/}
          {/*  </p>*/}
          {/*  <Button onClick={() => setIsModalOpen(true)}>*/}
          {/*    Оставить заявку*/}
          {/*  </Button>*/}
          {/*</div>*/}
        </div>
      </footer>
      {isModalOpen && (
        <ModalContact closeAction={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
