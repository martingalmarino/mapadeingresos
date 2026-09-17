import type { APIRoute } from 'astro';
import { indexingEnabled, site } from '../data/site';

export const GET: APIRoute = () => {
  const sitemapURL = new URL('sitemap-index.xml', `${site.origin}/`);
  const body = indexingEnabled
    ? `User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL.href}\n`
    : `User-agent: *\nDisallow: /\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
