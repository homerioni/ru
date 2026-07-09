'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ClubPhoto } from '@prisma/client';
import { Modal } from '@/components/ui/Modal';
import s from './styles.module.scss';

type ClubGalleryProps = {
  photos: ClubPhoto[];
};

export const ClubGallery = ({ photos }: ClubGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [activeIndex]);

  if (!photos.length) {
    return (
      <div className={`${s.empty} container`}>
        <p>В галерее пока нет фотографий.</p>
      </div>
    );
  }

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

  const showPrev = () => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + photos.length) % photos.length);
  };

  const showNext = () => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % photos.length);
  };

  return (
    <>
      <section className={`${s.main} container`}>
        <h1 className={s.title}>Фотогалерея</h1>
        <ul className={s.grid}>
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <button
                type="button"
                className={s.item}
                onClick={() => setActiveIndex(index)}
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

      {activePhoto && (
        <Modal
          closeHandler={() => setActiveIndex(null)}
          contentClassName={s.lightboxContent}
        >
          <div className={s.lightbox}>
            <button
              type="button"
              className={`${s.navBtn} ${s.navPrev}`}
              onClick={showPrev}
              aria-label="Предыдущее фото"
            />
            <div className={s.lightboxImageWrap}>
              <Image
                src={activePhoto.imageSrc}
                alt={activePhoto.caption ?? ''}
                width={1200}
                height={900}
                className={s.lightboxImage}
                sizes="90vw"
              />
            </div>
            <button
              type="button"
              className={`${s.navBtn} ${s.navNext}`}
              onClick={showNext}
              aria-label="Следующее фото"
            />
            {activePhoto.caption ? (
              <p className={s.lightboxCaption}>{activePhoto.caption}</p>
            ) : null}
            <p className={s.counter}>
              {(activeIndex ?? 0) + 1} / {photos.length}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};
