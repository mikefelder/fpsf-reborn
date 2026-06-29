import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://fpsf.dev',
  base: '/',
  output: 'static',
  integrations: [react(), sitemap()],
  build: {
    assets: '_assets',
  },
});
