'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ClubPhoto } from '@prisma/client';
import { SliderTitleBox } from '@ui/SliderTitleBox';
import { getClubGalleryHref } from '@/utils/getClubGalleryHref';
import s from './styles.module.scss';

type ClubGallerySliderProps = {
  photos: ClubPhoto[];
  clubId: number | string;
};

export const ClubGallerySlider = ({ photos, clubId }: ClubGallerySliderProps) => {
  const swiperRef = useRef<SwiperType>(null);

  if (!photos.length) return null;

  return (
    <section className={`${s.main} container`}>
      <SliderTitleBox swiperRef={swiperRef} title="Фотогалерея" />
      <Swiper
        spaceBetween={20}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        breakpoints={{
          0: {
            slidesPerView: 1.2,
          },
          769: {
            slidesPerView: 4,
          },
        }}
      >
        {photos.map((photo) => (
          <SwiperSlide key={photo.id}>
            <div className={s.slide}>
              <Image
                src={photo.imageSrc}
                alt={photo.caption ?? ''}
                width={320}
                height={240}
                className={s.image}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Link className={s.button} href={getClubGalleryHref(clubId)}>
        Смотреть всю галерею
      </Link>
    </section>
  );
};
