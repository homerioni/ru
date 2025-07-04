import { Header } from '~components/Header';
import { Intro } from '~components/Intro';
import { NextMatch } from '~components/NextMatch';
import { PreviousMatches } from '~components/PreviousMatches';

export default function MainPage() {
  return (
    <>
      <Header />
      <Intro />
      <NextMatch />
      <PreviousMatches />
    </>
  );
}
