'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ClubPhoto } from '@prisma/client';
import { Modal } from '@/components/ui/Modal';
import s from './styles.module.scss';

const SWIPE_THRESHOLD = 50;

type ClubGalleryProps = {
  photos: ClubPhoto[];
};

export const ClubGallery = ({ photos }: ClubGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const swipeStartX = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [activeIndex]);

  const showPrev = useCallback(() => {
    setActiveIndex((index) => {
      if (index === null) return null;
      return (index - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  const showNext = useCallback(() => {
    setActiveIndex((index) => {
      if (index === null) return null;
      return (index + 1) % photos.length;
    });
  }, [photos.length]);

  const handlePointerDown = (clientX: number) => {
    swipeStartX.current = clientX;
  };

  const handlePointerUp = (clientX: number) => {
    if (swipeStartX.current === null) return;

    const deltaX = clientX - swipeStartX.current;
    swipeStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    if (deltaX > 0) {
      showPrev();
    } else {
      showNext();
    }
  };

  const resetSwipe = () => {
    swipeStartX.current = null;
  };

  if (!photos.length) {
    return (
      <div className={`${s.empty} container`}>
        <p>В галерее пока нет фотографий.</p>
      </div>
    );
  }

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

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
            <div
              className={s.lightboxImageWrap}
              onPointerDown={(e) => handlePointerDown(e.clientX)}
              onPointerUp={(e) => handlePointerUp(e.clientX)}
              onPointerCancel={resetSwipe}
              onPointerLeave={resetSwipe}
            >
              <Image
                src={activePhoto.imageSrc}
                alt={activePhoto.caption ?? ''}
                width={1200}
                height={900}
                className={s.lightboxImage}
                sizes="90vw"
                draggable={false}
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
