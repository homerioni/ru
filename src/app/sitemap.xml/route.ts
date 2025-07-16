import { prisma } from '../../../prisma/prisma-client';

export async function GET() {
  const SITE_URL = 'https://rechutd.ru';

  const staticRoutes = ['', 'team', 'matches', 'tables'];

  const matchIds = await prisma.match
    .findMany({ select: { id: true } })
    .then((res) => res.map((item) => item.id));

  const urls = [
    ...staticRoutes.map((path) => `${SITE_URL}/${path}`),
    ...matchIds.map((id) => `${SITE_URL}/match/${id}`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('')}</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
