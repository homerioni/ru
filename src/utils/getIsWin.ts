/* eslint-disable */
import { Match } from '@prisma/client';

export const getIsWin = (code: string, match: Match, value?: any) => {
  switch (code) {
    case 'П1':
      return !!match.score.length && match.score[0] > match.score[1];
    case 'П2':
      return !!match.score.length && match.score[0] < match.score[1];
    case 'Н':
      return !!match.score.length && match.score[0] === match.score[1];
    case 'Г1':
      return (
        !!match.score.length && value !== undefined && match.score[0] === value
      );
    case 'Г2':
      return (
        !!match.score.length && value !== undefined && match.score[1] === value
      );
    case 'ГБ':
      return (
        !!match.score.length &&
        value !== undefined &&
        value <= match.score[0] + match.score[1]
      );
    case 'ГМ':
      return (
        !!match.score.length &&
        value !== undefined &&
        value >= match.score[0] + match.score[1]
      );
    case 'С':
      return (
        !!match.score.length &&
        value !== undefined &&
        match.score[0] === value[0] &&
        match.score[1] === value[1]
      );
    case 'Ж':
      return (
        match.yellowCards !== undefined &&
        match.yellowCards !== null &&
        value !== undefined &&
        match.yellowCards >= value
      );
    case 'К':
      return (
        match.redCards !== undefined &&
        match.redCards !== null &&
        value !== undefined &&
        match.redCards >= value
      );
    default:
      return;
  }
};

export const getIsQtyInput = (code: string) =>
  ['Г1', 'Г2', 'ГБ', 'ГМ', 'С', 'Ж', 'К'].includes(code);

export const getMinValue = (code: string) =>
  ['ГБ', 'ГМ', 'Ж', 'К'].includes(code) ? 1 : 0;

export function getCustomExponentialCoefficient(
  minVal: number,
  maxVal: number,
  value: number,
  gamma = 4,
  minCoef = 1.01,
  maxCoef = 10
) {
  // Ограничиваем value в допустимых пределах
  const clampedValue = Math.max(minVal, Math.min(maxVal, value));

  // Нормализуем значение в диапазон [0, 1]
  const t = (clampedValue - minVal) / (maxVal - minVal);

  // Применяем степенной рост
  const curvedT = Math.pow(t, gamma);

  // Интерполируем коэффициент
  const coef = minCoef + (maxCoef - minCoef) * curvedT;

  return coef;
}

export const getCoef = (
  ratio: number[],
  value: number,
  gamma = 4,
  minCoef = 1.01,
  maxCoef = 10
) =>
  ratio.length > 1
    ? +getCustomExponentialCoefficient(
        ratio[0],
        ratio[1],
        value,
        ratio[2] ? ratio[2] : gamma,
        ratio[3] ? ratio[3] : minCoef,
        ratio[4] ? ratio[4] : maxCoef
      ).toFixed(2)
    : ratio[0];
