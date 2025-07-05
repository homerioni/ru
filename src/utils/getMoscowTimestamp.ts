export const getMoscowTimestamp = () => {
  const now = new Date();

  return now.getTime() + now.getTimezoneOffset() * 60000 + 3 * 3600 * 1000;
};
