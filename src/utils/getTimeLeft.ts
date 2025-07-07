import { getEndingByAmount } from '@/utils/getEndingByAmount';

export const getTimeLeft = (time: number) => {
  const timeLeft = Math.floor(time / 1000);
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft - hours * 3600) / 60);
  const seconds = Math.floor(timeLeft - hours * 3600 - minutes * 60);

  return {
    hours: String(hours),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

export const getMatchLeft = (targetDate: Date) => {
  const now = new Date();
  const diffMs = +targetDate - +now;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (diffHours < 48 || targetDate.getDate() === tomorrow.getDate()) {
    return 'TIME';
  } else {
    return `Через ${diffDays} ${getEndingByAmount(diffDays, ['день', 'дня', 'дней'])}`;
  }
};
