export const getEndingByAmount = (number: number, declensions: string[]) => {
  const i = number % 10;
  const hundredRemainder = number % 100;

  if (hundredRemainder >= 11 && hundredRemainder <= 19) {
    return declensions[2];
  }

  switch (i) {
    case 1:
      return declensions[0];
    case 2:
    case 3:
    case 4:
      return declensions[1];
    default:
      return declensions[2];
  }
};
