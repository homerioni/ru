export type TRng = () => number;

export const mulberry32 = (seed: number): TRng => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pick = <T>(rng: TRng, list: T[], last?: T | null): T => {
  if (list.length === 1) return list[0];
  const index = Math.floor(rng() * list.length);
  const item = list[index];
  if (item === last) return list[(index + 1) % list.length];
  return item;
};
