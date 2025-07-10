export const ROUTES = {
  main: {
    name: 'Главная',
    href: '/',
  },
  team: {
    name: 'Команда',
    href: '/team',
  },
  matches: {
    name: 'Наши матчи',
    href: '/matches',
  },
  tables: {
    name: 'Турниры',
    href: '/tables',
  },
} as const;

export const LINKS = {
  telegram: 'https://t.me/rechitcaneunited',
  instagram: 'https://www.instagram.com/rechichaneunited',
} as const;

const adminRoute = '/panel';

export const adminRoutes = {
  main: adminRoute,
  games: `${adminRoute}/matches`,
  team: `${adminRoute}/team`,
  clubs: `${adminRoute}/clubs`,
  types: `${adminRoute}/types`,
} as const;

export const apiRoutes = {
  club: '/club',
  updateClub: '/club/update',
  clubs: '/clubs',
  match: '/match',
  nextMatch: '/match/next',
  updateMatch: '/match/update',
  matches: '/matches',
  matchType: '/match/type',
  updateMatchType: '/match/type/update',
  matchTypes: '/match/types',
  player: '/player',
  updatePlayer: '/player/update',
  players: '/players',
  upload: '/upload',
} as const;
