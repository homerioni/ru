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
