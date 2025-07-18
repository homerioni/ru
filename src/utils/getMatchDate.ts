export const getMatchDate = (date: Date) => {
  const matchDate = new Date(date);
  const day = matchDate.toLocaleDateString('ru-RU', {
    timeZone: 'Europe/Moscow',
    month: 'long',
    day: 'numeric',
  });
  const time = matchDate.toLocaleTimeString('ru-RU', {
    timeZone: 'Europe/Moscow',
    hour: '2-digit',
    minute: '2-digit',
  });
  const timestamp = matchDate.getTime();

  return { day, time, timestamp };
};
