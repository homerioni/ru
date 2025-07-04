'use client';

import { useRef } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { SliderTitleBox } from '@ui/SliderTitleBox';
import s from './styles.module.scss';
import { TeamCard } from '@/components/client/TeamCard';

export const TeamSlider = () => {
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
        <SwiperSlide>
          <TeamCard small />
        </SwiperSlide>
        <SwiperSlide>
          <TeamCard small />
        </SwiperSlide>
        <SwiperSlide>
          <TeamCard small />
        </SwiperSlide>
        <SwiperSlide>
          <TeamCard small />
        </SwiperSlide>
        <SwiperSlide>
          <TeamCard small />
        </SwiperSlide>
        <SwiperSlide>
          <TeamCard small />
        </SwiperSlide>
        <SwiperSlide>
          <TeamCard small />
        </SwiperSlide>
      </Swiper>
    </section>
  );
};
