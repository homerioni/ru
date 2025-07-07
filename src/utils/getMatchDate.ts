export const getMatchDate = (date: Date) => {
  const matchDate = new Date(date);
  const day = matchDate.toLocaleDateString('ru-RU', {
    month: 'long',
    day: 'numeric',
  });
  const time = matchDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const timestamp = matchDate.getTime();

  return { day, time, timestamp };
};
