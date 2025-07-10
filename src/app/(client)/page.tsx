'use client';

import { MainIntro } from 'src/components/client/MainIntro';
import { NextMatch } from '@/components/client/NextMatch';
import { PreviousMatchesSlider } from '@/components/client/PreviousMatchesSlider';
import { TeamSlider } from '@/components/client/TeamSlider';

export default function MainPage() {
  return (
    <>
      <MainIntro />
      <NextMatch />
      <PreviousMatchesSlider />
      <TeamSlider />
    </>
  );
}
