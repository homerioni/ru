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
  products: `${adminRoute}/products`,
  games: `${adminRoute}/games`,
  team: `${adminRoute}/team`,
  clubs: `${adminRoute}/clubs`,
} as const;

export const apiRoutes = {
  products: '/products',
  product: '/product',
  categories: '/categories',
  category: '/category',
  upload: '/upload',
  updateProduct: '/product/update',
} as const;
