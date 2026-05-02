'use client';

import { useEffect, useRef, useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { SliderTitleBox } from '@ui/SliderTitleBox';
import s from './styles.module.scss';
import { TeamCard } from '@/components/client/TeamCard';
import { TGetPlayers } from '@/types';
import Link from 'next/link';

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type TeamSliderProps = {
  players: TGetPlayers[];
  clubId?: number | string;
};

export const TeamSlider = ({ players, clubId }: TeamSliderProps) => {
  const swiperRef = useRef<SwiperType>(null);
  const [orderedPlayers, setOrderedPlayers] = useState(players);

  useEffect(() => {
    setOrderedPlayers(shuffle(players));
  }, [players]);

  return (
    <section className={`${s.main} container`}>
      <SliderTitleBox swiperRef={swiperRef} title={'Наша команда'} />
      <Swiper
        slidesPerView={4}
        spaceBetween={30}
        modules={[Autoplay]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: true,
        }}
        loop
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          769: {
            slidesPerView: 4,
          },
        }}
      >
        {orderedPlayers.map((player) => (
          <SwiperSlide key={player.id}>
            <TeamCard
              small
              id={player.id}
              number={player.number}
              matches={player.playedIn.length}
              name={player.name}
              position={player.position}
              photo={player.photo}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {clubId && (
        <Link className={s.button} href={`/club/${clubId}/team`}>
          Смотреть весь состав
        </Link>
      )}
    </section>
  );
};
