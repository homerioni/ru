'use client';

import { useRef } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import logo from '~assets/img/logo.svg';
import logoS from '~assets/img/soutnik.png';
import { MatchItem } from '~components/PreviousMatchesSlider/MatchItem';
import s from './styles.module.scss';
import { SliderTitleBox } from '~ui/SliderTitleBox';

const test = [
  { name: 'Речичане United', logoSrc: logo },
  { name: 'ФК Спутник', logoSrc: logoS },
];

export const PreviousMatchesSlider = () => {
  const swiperRef = useRef<SwiperType>(null);

  return (
    <section className={`${s.main} container`}>
      <SliderTitleBox swiperRef={swiperRef} title={'Сыгранные матчи'} />
      <Swiper
        spaceBetween={50}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          769: {
            slidesPerView: 2,
          },
        }}
      >
        <SwiperSlide>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            score={[3, 9]}
            date={'08 июля, 18:00'}
          />
        </SwiperSlide>
        <SwiperSlide>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            score={[8, 9]}
            date={'08 июля, 18:00'}
          />
        </SwiperSlide>
        <SwiperSlide>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            score={[8, 9]}
            date={'08 июля, 18:00'}
          />
        </SwiperSlide>
        <SwiperSlide>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            score={[8, 9]}
            date={'08 июля, 18:00'}
          />
        </SwiperSlide>
        <SwiperSlide>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            score={[8, 9]}
            date={'08 июля, 18:00'}
          />
        </SwiperSlide>
      </Swiper>
    </section>
  );
};
