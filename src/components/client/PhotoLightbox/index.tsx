'use client';

import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import { ClubPhoto } from '@prisma/client';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import './styles.scss';

type PhotoLightboxProps = {
  photos: ClubPhoto[];
  index: number;
  onClose: () => void;
};

export const PhotoLightbox = ({
  photos,
  index,
  onClose,
}: PhotoLightboxProps) => {
  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={photos.map((photo) => ({
        src: photo.imageSrc,
        alt: photo.caption || 'Фото',
        ...(photo.caption ? { description: photo.caption } : {}),
      }))}
      plugins={[Zoom, Captions, Counter]}
      carousel={{
        finite: false,
        preload: 2,
        padding: 0,
        imageFit: 'contain',
      }}
      animation={{ fade: 220, swipe: 320 }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
        pinchZoomV4: true,
      }}
      captions={{
        descriptionTextAlign: 'center',
        descriptionMaxLines: 3,
        showToggle: false,
      }}
      labels={{
        Next: 'Следующее фото',
        Previous: 'Предыдущее фото',
        Close: 'Закрыть',
        'Zoom in': 'Увеличить',
        'Zoom out': 'Уменьшить',
        '{index} of {total}': '{index} из {total}',
      }}
    />
  );
};
