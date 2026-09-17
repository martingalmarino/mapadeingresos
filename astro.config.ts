import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { indexingEnabled, siteOrigin } from './src/data/site';
import { editorialLastmod } from './src/data/editorial-dates';

export default defineConfig({
  site: siteOrigin,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => {
        if (!indexingEnabled) return false;
        const path = new URL(page).pathname;
        if (path.includes('/comparar')) return false;
        if (path.includes('404')) return false;
        return true;
      },
      serialize(item) {
        const path = new URL(item.url).pathname;
        const lastmod = editorialLastmod[path];
        if (lastmod) {
          item.lastmod = lastmod;
        }
        return item;
      },
      namespaces: {
        news: false,
        xhtml: false,
        image: false,
        video: false,
      },
    }),
  ],
});
