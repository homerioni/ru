'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ClubPhoto } from '@prisma/client';
import { PhotoLightbox } from '@/components/client/PhotoLightbox';
import s from './styles.module.scss';

type ClubGalleryProps = {
  photos: ClubPhoto[];
};

export const ClubGallery = ({ photos }: ClubGalleryProps) => {
  const [index, setIndex] = useState(-1);

  if (!photos.length) {
    return (
      <div className={`${s.empty} container`}>
        <p>В галерее пока нет фотографий.</p>
      </div>
    );
  }

  return (
    <>
      <section className={`${s.main} container`}>
        <h1 className={s.title}>Фотогалерея</h1>
        <ul className={s.grid}>
          {photos.map((photo, photoIndex) => (
            <li key={photo.id}>
              <button
                type="button"
                className={s.item}
                onClick={() => setIndex(photoIndex)}
              >
                <Image
                  src={photo.imageSrc}
                  alt={photo.caption ?? ''}
                  width={480}
                  height={360}
                  className={s.image}
                  sizes="(max-width: 48em) 50vw, 25vw"
                />
                {photo.caption ? (
                  <span className={s.caption}>{photo.caption}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <PhotoLightbox
        photos={photos}
        index={index}
        onClose={() => setIndex(-1)}
      />
    </>
  );
};
