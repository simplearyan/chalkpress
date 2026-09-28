import { defineConfig } from 'astro/config';

// Deploy-target config (GitHub Pages):
//   - Production root domain →      SITE='https://iitm.example.com'            (no base)
//   - Project pages (user.github.io/repo) →  BASE='/iitm-site' SITE='https://user.github.io/iitm-site'
// The GH workflow sets BASE automatically; local dev/build stays root-relative.
const SITE = process.env.SITE || 'https://iitm.example.com'; // TODO: change before deploy
const BASE = process.env.BASE || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  srcDir: 'src',
  outDir: 'dist',
});
