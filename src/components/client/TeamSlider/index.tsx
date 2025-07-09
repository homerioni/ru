'use client';

import { useEffect, useRef, useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { SliderTitleBox } from '@ui/SliderTitleBox';
import s from './styles.module.scss';
import { TeamCard } from '@/components/client/TeamCard';
import { getPlayers } from '@/services';
import { TGetPlayer } from '@/types';

export const TeamSlider = () => {
  const [players, setPlayers] = useState<TGetPlayer[]>();

  const swiperRef = useRef<SwiperType>(null);

  useEffect(() => {
    getPlayers().then((res) => {
      setPlayers(res.players.sort(() => Math.random() - 0.5));
    });
  }, []);

  if (!players) {
    return null;
  }

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
        {players.map((player) => (
          <SwiperSlide key={player.id}>
            <TeamCard
              small
              number={player.number}
              matches={player.playedIn.length}
              name={player.name}
              position={player.position}
              photo={player.photo}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
