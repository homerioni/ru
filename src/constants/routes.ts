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
    name: 'Календарь',
    href: '/calendar',
    isProtected: false,
  },
  blog: {
    name: 'Блог',
    href: '/blog',
    isProtected: false,
  },
} as const;

export const LINKS = {
  telegram: 'https://t.me/rechitcaneunited',
  instagram: 'https://www.instagram.com/rechichaneunited',
} as const;
