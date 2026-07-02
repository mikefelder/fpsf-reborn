import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Years that are built and reachable by URL but intentionally not part of the
// hosted rotation (see HOSTED_FROM_YEAR in src/data/show-years.ts). Keep them
// out of the sitemap so search engines don't index the non-hosted editions.
const SITEMAP_EXCLUDED_YEARS = [2010, 2011];

export default defineConfig({
  site: 'https://fpsf.dev',
  base: '/',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !SITEMAP_EXCLUDED_YEARS.some((year) => page.includes(`/${year}/`)),
    }),
  ],
  build: {
    assets: '_assets',
  },
});
