'use client';

import { useEffect, useRef, useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MatchItem } from '@/components/client/MatchItem';
import s from './styles.module.scss';
import { SliderTitleBox } from '@ui/SliderTitleBox';
import { getMatches } from '@/services';
import { getMatchDate } from '@/utils/getMatchDate';
import { TGetMatch } from '@/services/matches';
import { MY_CLUB_ID } from '@/constants';

export const PreviousMatchesSlider = () => {
  const [matches, setMatches] = useState<TGetMatch[]>();

  const swiperRef = useRef<SwiperType>(null);

  useEffect(() => {
    getMatches({ clubId: MY_CLUB_ID }).then((res) => {
      const dateNow = Date.now();

      const oldMatches = res.matches.filter(
        (match) => new Date(match.date).getTime() <= dateNow
      );

      setMatches(oldMatches);
    });
  }, []);

  if (!matches) {
    return null;
  }

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
