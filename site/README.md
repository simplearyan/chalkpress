# IITM site — Shorts Library + Solutions Portals

Static Astro site generated from the canonical content store one level up
(`../content/subjects/**`). Every page is content-driven: adding a question
folder is enough for it to appear everywhere it qualifies.

```
content/subjects/<subject>/<id>/
  index.md          # frontmatter (identity, answer, given/goal, prompt) + statement
  solution.md       # ## steps → timeline cards; final "## Answer" → answer card
  script.md         # "0–4s · scene: intro" beats → script sheet + visual plan
  storyboard.json   # scene timeline (templates/storyboard.schema.json) → player
```

## Pages

| Route | What |
|---|---|
| `/` | Shorts Library — animated/rendered/published questions as poster cards |
| `/<subject>/` | Solutions portal — search + topic chips + exam-style list |
| `/<subject>/<id>/` | Problem page — the mock design: Try-it quiz, sticky givens, numbered steps, answer card, **Build the short** (player + Animation brief + script + code drawer), Up Next |

## Animation preview (same engine as the editor)

The problem page's player is **test-renderer's engine**: `hic-frame.js`
(vendored at `public/vendor/`) rasterizes the compiled storyboard clip
(`runtime/hic-storyboard.js` → self-contained `onFrame(t)` clip) into a
canvas — SVG foreignObject with KaTeX/Tailwind/font embedding, wall-clock
playback, scrubber. What you see on the site is pixel-identical to the
editor preview and the WebM export.

**Seamless round-trip with test-renderer:**

- **Copy code** (player button) emits the clip as three fenced blocks with
  `<title>`, `<!-- ds:16:9 -->` and `<!-- dur:17500 -->` markers —
  test-renderer's AI tab parses it as-is (auto-applies code, name, design
  space AND duration; it even opens a blank stage if none is loaded).
- **AI prompt** / the page's *Animation brief* drawer emits the same
  contract test-renderer's *Copy AI Prompt* uses — paste into any model,
  paste the reply back in either tool.
- **Renderer** button opens test-renderer via `#storyboard=<base64url>`
  deep link. When the editor lives on another origin, set
  `localStorage.iitmTrUrl = 'https://…/test-renderer.html'` once.

## Commands

```bash
npm run site:dev        # astro dev (root-relative, no base)
npm run site:build      # astro build → site/dist
npm run site:preview    # serve the build
npm run validate        # schema/timeline validation for the content store
```

## Deploy (GitHub Pages)

`.github/workflows/deploy-site.yml` — on every push touching `content/`,
`runtime/`, or `site/`: validates the content store, `npm ci` + builds with

```
SITE=https://<owner>.github.io/<repo>  BASE=/<repo>
```

then deploys `site/dist` via the official Pages actions. Root-domain
deploys: set `SITE` in `site/astro.config.mjs` and drop the `BASE` export.
First deploy: repo **Settings → Pages → Source: GitHub Actions**.

## Social images + favicon — rendered by test-renderer (experiment)

The OG/twitter cards and favicon are **frames of the shorts themselves**:
`runtime/hic-storyboard.js` compiles a storyboard → open the standalone
poster page (`public/meta-src/`) or paste the Copy-code payload into
test-renderer → scrub to the beat → **Save Frame PNG** → commit to
`site/public/`. Full pipeline + status: [`public/meta-src/README.md`](public/meta-src/README.md).

Currently expected assets: `favicon-32.png`, `favicon-64.png`,
`og-default.png`, `<id>-og.png` per question (referenced by Base.astro —
generate them before a public deploy; the meta-src sources are committed).
