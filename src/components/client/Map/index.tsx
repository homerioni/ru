'use client';

import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import s from './styles.module.scss';

export const MyMap = ({
  coordinates = [52.364996, 30.425191],
}: {
  coordinates?: [number, number];
}) => {
  return (
    <section className={s.main}>
      <YMaps>
        <Map
          width="100%"
          height="100%"
          defaultState={{ center: coordinates, zoom: 16 }}
        >
          <Placemark
            geometry={coordinates}
            options={{
              iconLayout: 'default#image',
              iconImageHref: '/pin.png',
              iconImageSize: [50, 75],
              iconImageOffset: [-25, -75],
            }}
          />
        </Map>
      </YMaps>
    </section>
  );
};
