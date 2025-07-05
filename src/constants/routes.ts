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
  matches: {
    name: 'Матчи',
    href: '/matches',
    isProtected: false,
  },
} as const;

export const LINKS = {
  telegram: 'https://t.me/rechitcaneunited',
  instagram: 'https://www.instagram.com/rechichaneunited',
} as const;

const adminRoute = '/panel';

export const adminRoutes = {
  main: adminRoute,
  games: `${adminRoute}/games`,
  team: `${adminRoute}/team`,
  clubs: `${adminRoute}/clubs`,
} as const;

export const apiRoutes = {
  club: '/club',
  updateClub: '/club/update',
  clubs: '/clubs',
  match: '/match',
  updateMatch: '/match/update',
  matches: '/matches',
  player: '/player',
  updatePlayer: '/player/update',
  players: '/players',
  upload: '/upload',
} as const;
