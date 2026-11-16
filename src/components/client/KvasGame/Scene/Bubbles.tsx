import s from './styles.module.scss';

type BubblesProps = {
  bubbles: { id: number; text: string }[];
};

export const Bubbles = ({ bubbles }: BubblesProps) => (
  <div className={s.bubbles}>
    {bubbles.map((bubble) => (
      <p key={bubble.id} className={s.bubble}>
        {bubble.text}
      </p>
    ))}
  </div>
);
