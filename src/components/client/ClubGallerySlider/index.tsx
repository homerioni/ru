'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ClubPhoto } from '@prisma/client';
import { SliderTitleBox } from '@ui/SliderTitleBox';
import { getClubGalleryHref } from '@/utils/getClubGalleryHref';
import { PhotoLightbox } from '@/components/client/PhotoLightbox';
import s from './styles.module.scss';

type ClubGallerySliderProps = {
  photos: ClubPhoto[];
  clubId: number | string;
};

export const ClubGallerySlider = ({ photos, clubId }: ClubGallerySliderProps) => {
  const swiperRef = useRef<SwiperType>(null);
  const [index, setIndex] = useState(-1);

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
        {photos.map((photo, photoIndex) => (
          <SwiperSlide key={photo.id}>
            <button
              type="button"
              className={s.slide}
              onClick={() => setIndex(photoIndex)}
            >
              <Image
                src={photo.imageSrc}
                alt={photo.caption ?? ''}
                width={320}
                height={240}
                className={s.image}
              />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
      <Link className={s.button} href={getClubGalleryHref(clubId)}>
        Смотреть всю галерею
      </Link>
      <PhotoLightbox
        photos={photos}
        index={index}
        onClose={() => setIndex(-1)}
      />
    </section>
  );
};
