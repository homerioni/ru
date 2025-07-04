'use client';

import { useRef } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import logo from '~assets/img/logo.svg';
import logoS from '~assets/img/soutnik.png';
import { MatchItem } from '~components/PreviousMatches/MatchItem';
import s from './styles.module.scss';

const test = [
  { name: 'Речичане United', logoSrc: logo },
  { name: 'ФК Спутник', logoSrc: logoS },
];

export const PreviousMatches = () => {
  const swiperRef = useRef<SwiperType>(null);

  return (
    <section className={`${s.main} container`}>
      <div className={s.titleBox}>
        <h3 className={s.title}>Сыгранные матчи</h3>
        <div className={s.controls}>
          <button
            type="button"
            className={s.prevBtn}
            onClick={() => swiperRef.current?.slidePrev()}
          />
          <button
            type="button"
            className={`${s.nextBtn} ${s.right}`}
            onClick={() => swiperRef.current?.slideNext()}
          />
        </div>
      </div>
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
