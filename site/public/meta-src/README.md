# meta-src — social images rendered by test-renderer (experiment)

The site's OG/twitter images and the favicon are **generated from the same
clip engine that plays the shorts**: the storyboard is compiled by
`runtime/hic-storyboard.js`, rendered by test-renderer's HicRenderer
(SVG-foreignObject → canvas → PNG), and the raster becomes static site art.

Why: one visual language everywhere — the social card IS a frame of the
short, and regenerating art after a storyboard edit is a re-render, not a
redesign.

## Pipeline (per question)

1. **Compile the poster frame** (done in-repo, one command):

   ```bash
   cd studios/IITM
   node -e "import('./runtime/hic-storyboard.esm.js').then(({buildStandalonePage})=>{
     const fs=require('fs');
     const sb=JSON.parse(fs.readFileSync('content/subjects/<topic>/<id>/storyboard.json','utf8'));
     fs.mkdirSync('site/public/meta-src',{recursive:true});
     fs.writeFileSync('site/public/meta-src/<id>-poster.html', buildStandalonePage(sb));
   })"
   ```

   `buildStandalonePage()` emits a self-booting HTML page that renders the
   storyboard and holds its final frame (t loops the 17.5s choreography).

2. **Open test-renderer** (vite on the studio repo root):
   `http://localhost:5173/studios/IITM/site/public/meta-src/<id>-poster.html`
   — or paste the compiled code into test-renderer's AI tab (the site's
   **Copy code** payload parses as-is).

3. **Capture the frame** in test-renderer:
   - set frame aspect **1:1** (OG square) or **16:9** (og:image 1200×630 —
     pillarboxing is fine on a matching bg), scrub to the beat you want
     (for pq-002: **t≈16.5s** — the "4 / 4 CORRECT" verdict with highlight),
   - **Save Frame PNG** → `site/public/<id>-og.png`.

4. **Favicon**: same path with `favicon.html` (static ✓ glyph on the stage
   green), frame 1:1, Save Frame at 64px — or capture 512px and downscale to
   `favicon-64.png` / `favicon-32.png`.

5. Commit the PNGs (the `meta-src/*.html` sources stay in-repo too, so the
   art is reproducible; the standalone pages are ~8 KB each).

## Status

- [x] `pq-002-poster.html` — compiled storyboard poster source (this dir)
- [x] `favicon.html` — static favicon source frame
- [x] `pq-002-og.png` — captured via test-renderer Save Frame (1080p, t=16.5s verdict beat)
- [x] `og-default.png` — same capture, site-wide default card
- [x] `favicon-32.png` / `favicon-64.png` — rendered from `favicon.html` at 512², downscaled
- [ ] pq-001 poster + og (same commands)

> This is the documented experiment: **test-renderer as the site's art
> pipeline** — proven end-to-end on pq-002 (OG 1920×1080 @ 38 KB + favicons).
> If it sticks, a `tools/render-meta.mjs` (Playwright-driven HicRenderer,
> zero manual steps) is the natural follow-up.
