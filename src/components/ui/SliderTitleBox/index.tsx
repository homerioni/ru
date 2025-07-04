import { Swiper as SwiperType } from 'swiper';
import s from './styles.module.scss';
import { RefObject } from 'react';

type TSliderTitleBoxProps = {
  swiperRef: RefObject<SwiperType | null>;
  title: string;
};

export const SliderTitleBox = ({ swiperRef, title }: TSliderTitleBoxProps) => {
  return (
    <div className={s.titleBox}>
      <h3 className={s.title}>{title}</h3>
      <div className={s.controls}>
        <button
          type="button"
          className={s.prevBtn}
          onClick={() => swiperRef.current?.slidePrev()}
        />
        <button
          type="button"
          className={`${s.nextBtn} ${s.right}`}
          onClick={() => swiperRef.current?.slideNext()}
        />
      </div>
    </div>
  );
};
