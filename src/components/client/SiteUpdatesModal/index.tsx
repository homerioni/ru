'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { SiteUpdate } from '@prisma/client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getSiteUpdates } from '@/services';
import {
  getReadSiteUpdateIds,
  markSiteUpdateAsRead,
} from '@/utils/siteUpdateReadStorage';
import s from './styles.module.scss';

const MIN_VIEW_MS = 2000;

export const SiteUpdatesModal = () => {
  const [items, setItems] = useState<SiteUpdate[] | null>(null);
  const [index, setIndex] = useState(0);
  const slideStartRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;

    getSiteUpdates()
      .then((updates) => {
        if (cancelled) return;
        const read = new Set(getReadSiteUpdateIds());
        const unread = updates.filter((u) => !read.has(u.id));
        if (unread.length === 0) return;
        setItems(unread);
        slideStartRef.current = Date.now();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    slideStartRef.current = Date.now();
  }, [index]);

  useEffect(() => {
    if (!items?.length) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [items]);

  const commitCurrentIfEligible = () => {
    if (!items?.length) return;
    const current = items[index];
    if (!current) return;
    const elapsed = Date.now() - slideStartRef.current;
    if (elapsed >= MIN_VIEW_MS) {
      markSiteUpdateAsRead(current.id);
    }
  };

  const handleClose = () => {
    commitCurrentIfEligible();
    setItems(null);
  };

  const handleNext = () => {
    commitCurrentIfEligible();
    if (!items) return;
    if (index < items.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setItems(null);
    }
  };

  if (!items?.length) return null;

  const current = items[index];
  const isLast = index === items.length - 1;
  const stepLabel = `${index + 1} / ${items.length}`;

  return (
    <Modal closeHandler={handleClose} contentClassName={s.content}>
      <div className={s.inner}>
        <p className={s.step}>{stepLabel}</p>
        <h2 className={s.title}>{current.title}</h2>
        {current.imageSrcs?.length ? (
          <div className={s.images}>
            {current.imageSrcs.map((src) => (
              <div key={src} className={s.imageWrap}>
                <Image
                  src={src}
                  alt=""
                  width={800}
                  height={450}
                  className={s.image}
                  sizes="(max-width: 48em) 90vw, 640px"
                />
              </div>
            ))}
          </div>
        ) : null}
        <div className={s.description}>{current.description}</div>
        <div className={s.actions}>
          <Button variant="secondary" type="button" onClick={handleClose}>
            Закрыть
          </Button>
          <Button type="button" onClick={handleNext}>
            {isLast ? 'Готово' : 'Далее'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
