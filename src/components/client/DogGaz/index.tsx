'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gaz1 from '@/assets/img/gaz.webp';
import gaz2 from '@/assets/img/gaz2.webp';
import s from './styles.module.scss';

const YELL_DURATION = 2000;
const GAZ_SOUND = '/gaz.mp3';

export const DogGaz = () => {
  const [isYelling, setIsYelling] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(GAZ_SOUND);
    audioRef.current.preload = 'auto';

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const handleClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }

    setIsYelling(true);

    timeoutRef.current = setTimeout(() => {
      setIsYelling(false);
      timeoutRef.current = null;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }, YELL_DURATION);
  };

  return (
    <button
      type="button"
      className={`${s.wrapper} ${isYelling ? s.yelling : ''}`}
      onClick={handleClick}
      aria-label="Газ! Даём!"
    >
      <Image
        src={isYelling ? gaz2 : gaz1}
        alt="Газ! Даём!"
        width={200}
        height={200}
      />
    </button>
  );
};
