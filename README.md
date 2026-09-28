# IITM Studio

Content factory for short-form math explainers: questions + solutions + scripts
+ storyboards in plain files, one shared animation runtime, a generated static
site, and (planned) AI-assisted authoring → render → YouTube pipeline.

See `IITM-FUTURE-PLAN.md` for the full architecture rationale.

## Layout

```
content/          ★ canonical store — one folder per question
  subjects/<subject>/<id>/
    index.md          question + YAML frontmatter (status, video, youtube…)
    solution.md       worked steps (## per step)
    script.md         narration beats (## 0–4s · scene: id)
    storyboard.json   animation timeline (validated against templates/)
templates/        file templates + storyboard JSON Schema
runtime/          ★ shared vanilla animation engine (no framework, no build)
  hic-scenes.js     ES module; also registers window.createScenePlayer
  hic-scenes.css
  demo.html         standalone proof page (vite or any static server)
site/             ★ Astro static site — the ONLY place with a build step
  src/pages/        library (index), [subject] portal, [subject]/[id] problem page
  src/components/   ShortCard, Player (boots hic-scenes from storyboard.json)
tools/            vanilla Node CLI
  validate.mjs      schema + frontmatter + timeline validation (CI-ready)
mocks/            original hand-built design mocks (reference only)
```

## Commands

```bash
node tools/validate.mjs          # validate all content (exit 1 on violations)
node tools/validate.mjs pq-001   # validate one question

cd site
npm install                      # first time only
npm run dev                      # dev server (astro)
npm run build                    # static build → site/dist
npm run preview                  # serve the built site

# runtime demo (no install needed)
npx vite --port 5180             # then open /runtime/demo.html
```

## Adding a question

1. Copy `templates/index.md` → `content/subjects/<subject>/<id>/index.md`, fill frontmatter + question body.
2. Write `solution.md` (## per step). Status stays `draft`.
3. `script.md` beats + `storyboard.json` (see `content/subjects/probability/pq-001/` as the reference).
4. `node tools/validate.mjs <id>` must pass.
5. Build the site — the question appears in its portal automatically; the
   library shelf lists it once `status:` reaches `animated`/`rendered`/`published`.

## Rules that keep the system sane

- **`content/` has no framework in it.** Markdown + JSON only — readable by
  the site, the CLI, the render pipeline, and humans.
- **One runtime.** `runtime/hic-scenes.js` drives pages, modals, and the
  (planned) Puppeteer WebM renderer; `render(t)` is deterministic/pure.
- **Only `site/` knows Astro.** Replaceable without touching content or tools.
