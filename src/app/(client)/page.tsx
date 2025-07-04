import { Intro } from '@/components/client/Intro';
import { NextMatch } from '@/components/client/NextMatch';
import { PreviousMatchesSlider } from '@/components/client/PreviousMatchesSlider';
import { TeamSlider } from '@/components/client/TeamSlider';

export default function MainPage() {
  return (
    <>
      <Intro />
      <NextMatch />
      <PreviousMatchesSlider />
      <TeamSlider />
    </>
  );
}
