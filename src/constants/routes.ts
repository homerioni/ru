export const ROUTES = {
  main: {
    name: 'Главная',
    mobName: undefined,
    href: '/',
  },
  team: {
    name: 'Команда',
    mobName: undefined,
    href: '/team',
  },
  matches: {
    name: 'Наши матчи',
    mobName: undefined,
    href: '/matches',
  },
  tables: {
    name: 'Турниры',
    mobName: undefined,
    href: '/tables',
  },
  votes: {
    name: 'Голосования',
    mobName: undefined,
    href: '/votes',
  },
  clubs: {
    name: 'Другие команды',
    mobName: undefined,
    href: '/clubs',
  },
} as const;

export const LINKS = {
  telegram: 'https://t.me/rechitcaneunited',
  instagram: 'https://www.instagram.com/rechichaneunited',
} as const;

const adminRoute = '/panel';
const clubAdminRoute = '/admin';

export const adminRoutes = {
  main: adminRoute,
  games: `${adminRoute}/matches`,
  team: `${adminRoute}/team`,
  clubs: `${adminRoute}/clubs`,
  types: `${adminRoute}/types`,
  transfers: `${adminRoute}/transfers`,
  siteUpdates: `${adminRoute}/site-updates`,
  requestLogs: `${adminRoute}/request-logs`,
} as const;

export const clubAdminRoutes = {
  main: clubAdminRoute,
  games: `${clubAdminRoute}/matches`,
  team: `${clubAdminRoute}/team`,
  clubs: `${clubAdminRoute}/clubs`,
  types: `${clubAdminRoute}/types`,
  transfers: `${clubAdminRoute}/transfers`,
} as const;

export const apiRoutes = {
  club: '/club',
  updateClub: '/club/update',
  clubs: '/clubs',
  match: '/match',
  nextMatch: '/match/next',
  nextMatches: '/match/allNext',
  matchType: '/match/type',
  matchTypeGetAll: '/match/type/getAll',
  matchVote: '/match/vote',
  votesMatches: '/votes/matches',
  player: '/player',
  updatePlayer: '/player/update',
  award: '/award',
  players: '/players',
  top: '/top',
  tg: '/tg',
  tgProfile: '/tg-profile-request',
  upload: '/upload',
  transfers: '/transfers',
  userPlayer: '/user-player',
  siteUpdates: '/site-updates',
  adminRequestLogs: '/admin-request-logs',
} as const;
