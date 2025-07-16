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
  tops: {
    name: 'Лидеры ставок',
    href: '/tops',
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
  bets: `${adminRoute}/bets`,
} as const;

export const apiRoutes = {
  club: '/club',
  updateClub: '/club/update',
  clubs: '/clubs',
  match: '/match',
  nextMatch: '/match/next',
  nextMatches: '/match/allNext',
  matchType: '/match/type',
  player: '/player',
  updatePlayer: '/player/update',
  players: '/players',
  betEvent: '/bets',
  betType: '/bets/type',
  addBet: '/bets/add',
  completedBetEvent: '/bets/complete',
  refund: '/bets/refund',
  top: '/top',
  upload: '/upload',
} as const;
