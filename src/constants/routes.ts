export const ROUTES = {
  main: {
    name: 'Главная',
    href: '/',
    isProtected: false,
  },
  team: {
    name: 'Команда',
    href: '/team',
    isProtected: false,
  },
  calendar: {
    name: 'Матчи',
    href: '/calendar',
    isProtected: false,
  },
} as const;

export const LINKS = {
  telegram: 'https://t.me/rechitcaneunited',
  instagram: 'https://www.instagram.com/rechichaneunited',
} as const;
