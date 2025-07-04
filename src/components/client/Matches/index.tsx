import logo from '@/assets/img/logo.svg';
import logoS from '@/assets/img/soutnik.png';
import { MatchItem } from '@/components/client/MatchItem';
import s from './styles.module.scss';

const test = [
  { name: 'Речичане United', logoSrc: logo },
  { name: 'ФК Спутник', logoSrc: logoS },
];

export const Matches = () => {
  return (
    <section className={`${s.main} container`}>
      <h1 className={s.title}>Будущие матчи</h1>
      <ul className={s.list}>
        <li>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            date={'08 июля, 18:00'}
          />
        </li>
        <li>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            date={'08 июля, 18:00'}
          />
        </li>
        <li>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            date={'08 июля, 18:00'}
          />
        </li>
        <li>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            date={'08 июля, 18:00'}
          />
        </li>
      </ul>
      <h2 className={s.title}>Сыгранные матчи</h2>
      <ul className={s.list}>
        <li>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            date={'08 июля, 18:00'}
            score={[3, 9]}
          />
        </li>
        <li>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            date={'08 июля, 18:00'}
            score={[3, 9]}
          />
        </li>
        <li>
          <MatchItem
            clubs={test}
            type={'Товарищеский матч'}
            date={'08 июля, 18:00'}
            score={[3, 9]}
          />
        </li>
      </ul>
    </section>
  );
};
