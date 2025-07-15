'use client';

import { useRef } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MatchItem } from '@/components/client/MatchItem';
import s from './styles.module.scss';
import { SliderTitleBox } from '@ui/SliderTitleBox';
import { getMatchDate } from '@/utils/getMatchDate';
import { TGetMatch } from '@/services/matches';

type PreviousMatchesSliderProps = {
  matches: TGetMatch[];
};

export const PreviousMatchesSlider = ({
  matches,
}: PreviousMatchesSliderProps) => {
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
        {matches?.map((match) => {
          const matchDate = getMatchDate(match.date);

          return (
            <SwiperSlide key={match.id}>
              <MatchItem
                id={match.id}
                clubs={[match.homeClub, match.awayClub]}
                type={match.type.name}
                score={match.score}
                date={`${matchDate.day}, ${matchDate.time}`}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};
