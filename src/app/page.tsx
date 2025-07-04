import { Intro } from '~components/Intro';
import { NextMatch } from '~components/NextMatch';
import { PreviousMatchesSlider } from '~components/PreviousMatchesSlider';
import { TeamSlider } from '~components/TeamSlider';

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
