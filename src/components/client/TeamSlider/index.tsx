'use client';

import { useRef } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { SliderTitleBox } from '@ui/SliderTitleBox';
import s from './styles.module.scss';
import { TeamCard } from '@/components/client/TeamCard';
import { TGetPlayer } from '@/types';

type TeamSliderProps = {
  players: TGetPlayer[];
};

export const TeamSlider = ({ players }: TeamSliderProps) => {
  const swiperRef = useRef<SwiperType>(null);

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
