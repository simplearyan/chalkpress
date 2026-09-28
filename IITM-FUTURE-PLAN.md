# IITM Studio — Future Plan

**Date:** 2026-09-25 · **Inputs:** `index.html`, `multivariable_calculus_solutions_portal (5).html`, `problem-1-*` (base, (3), (5)), `problem-2-*` (base, (1), (3))

---

## 1. What the designs are today

| File | Role | Data lives as |
|---|---|---|
| `index.html` | Shorts Library shelf (2 cards + "More soon") | Hand-written HTML cards |
| `multivariable_calculus_solutions_portal (5)` | Subject portal: 14 questions, search, category filters, list/exam modes, keypads, calculator dialog | One hardcoded JS array `questionsData` (14 objects: title, category, funcText, questionHtml, finalAnswer, steps[]) |
| `problem-1 / problem-2` (3 iterations each) | Single "solve → build-the-short" page: worked solution, Try-it-yourself quiz, animation player (scenes with timeline JS), narration script, visual plan, copyable HTML/CSS/JS code blocks | Question + steps as raw HTML, script as `<p>` lines, animation as **inline `<script type="text/plain" id="source-html/css/js">` blocks** duplicated between the live player and the copy blocks |

The proven pattern: **one problem page = (a) worked solution, (b) Try-it quiz, (c) 9:16/16:9 animation player, (d) short-form narration script, (e) visual plan, (f) copyable animation code.** The portal proves browse/filter/exam UX at small scale. Everything is hardcoded per file — zero data/tooling separation.

**Stack:** hand-written HTML + vanilla JS; page 3 uses Tailwind CDN + MathJax; problem pages use KaTeX + container-query scaling; duplicated 200-line timeline JS per file (and *twice* inside each file — live player + source dump).

---

## 2. Goal

A content factory for **thousands of questions across many subjects**, where:

1. Questions + solutions are stored once, not copied per page.
2. AI generates explainer scripts and animation storyboards/code from a stored question.
3. Humans review in the existing tools (test-renderer → design gallery → Studio Pro), render final WebM/MP4.
4. Finished videos publish to a website (library/portal UX you already have) and YouTube.

---

## 3. Storage: Markdown vs Google Sheets (vs hybrid)

### 3.1 What must be stored, per question

| Field | Example | Notes |
|---|---|---|
| id, subject, topic, difficulty, source | `calc-dd-001` | Stable keys; used in URLs, filenames |
| Question text + math | `$f(x,y)=xy^2/(x^2+y^4)$ …` | LaTeX, links, images |
| Final answer + type | `Options B and D` / `value: 2` | MCQ options too |
| Worked steps | 3–6 titled steps | Reused in page + script |
| Explainer script | 8–12 narration lines | ~15s or ~60s variant |
| Storyboard | Scenes with start/end, on-screen text, layout | Machine-readable |
| Animation code | HTML/CSS/JS clip | Built in Studio Pro; final source of truth after QA |
| Render + publish status | `draft→scripted→animated→rendered→published` | Pipeline state |
| Video path, YouTube ID | `renders/.../final.mp4`, `dQw4w9WgXcQ` | After render/upload |

### 3.2 Comparison

| | Markdown files (Git repo) | Google Sheets | Hybrid (recommended) |
|---|---|---|---|
| 1,000s of items | ✅ trivial | ⚠️ 10M-cell cap, slow past ~50k rows, 1 sheet = 1 spreadsheet | ✅ |
| Math/code in cells | ✅ (any length) | ❌ formulas/newlines get mangled; code blocks of 100+ lines are unusable | ✅ code stays in files |
| Versioning / history / diff | ✅ Git blame, PRs | ⚠️ revision history, no diffs | ✅ |
| Non-coder editing | ⚠️ needs VS Code | ✅ they already know Sheets | ✅ |
| Bulk ops / status dashboards | ❌ needs tooling | ✅ filters/pivots native | ✅ |
| AI ingestion (paste a question, generate solution) | ❌ file I/O | ✅ Apps Script + LLM API writes rows | ✅ |
| Offline / backups | ✅ | ❌ | ✅ |
| Collision risk at scale | Merge conflicts on shared index files | Cell-level, safe | ✅ |

### 3.3 Recommendation: hybrid (repo as source of truth, Sheet as work queue)

- **Repo (Git) = canonical store.** One folder per question:
  ```
  content/
    subjects/
      multivariable-calculus/
        calc-dd-001/
          index.md        # question, answer, options, difficulty, tags, status (YAML frontmatter)
          solution.md     # worked steps (reused by page + script generator)
          script.md       # narration lines: ## 0-4s scene lines
          storyboard.json # scenes[] {id, label, startMs, endMs, text, layout}
          anim/           # html/css/js animation code (Studio Pro output)
      physics/mechanics/...
    topics.json          # taxonomy: subject → topic → ids
  ```
- `index.md` frontmatter (all one-liners, perfect for sync):
  ```yaml
  id: calc-dd-001
  subject: multivariable-calculus
  topic: directional-derivatives
  difficulty: medium
  source: GATE 2024
  answer_type: options      # or "value"
  answer: "Options B and D"
  status: scripted          # draft|scripted|animated|rendered|published
  video: renders/calc-dd-001/final.mp4
  youtube: ""
  ```
- **Google Sheet = editorial pipeline view** (columns: id · subject · question-truncated · assignee · status · notes). One row per question. Edited freely; synced **to** the repo by a script (Sheet is a view, never the source of truth). Import path: paste 50 raw questions → Apps Script/CLI calls Gemini/GPT → writes `index.md`+`solution.md` drafts → reviewers tick status in the Sheet.
- If you insist on one system: **pick Markdown.** It's the only one that holds 1,000s of items with math and code intact. Sheets can be the front-end later.

---

## 4. Vanilla JS vs frameworks

**Recommendation: stay vanilla-first for the site; add a build step; do NOT adopt React for pages.**

- The site is content pages + a player — closest proven model is an **SSG (Astro)**: zero-JS by default, islands when needed, content-collections from markdown = exactly the hybrid storage model. It also has first-class MDX/kaTeX support.
- Your animation runtime, hic-modal, hic-frame, test-renderer, Studio Pro are all vanilla and working. A React rewrite buys nothing there and breaks the copy/paste clip workflow.
- If the *authoring tool* (dashboard for thousands of questions, status, batch AI generation, review queue) grows a real UI, a **small framework (Preact/Svelte/Vue) just for the dashboard** is fine — it doesn't touch the public site.
- Alternatives: 11ty (simpler, less batteries) or Next/Astro-hybrid if you later want server features. For the animation **player**, keep vanilla + a tiny runtime (see §6).

**Decision table:**

| Concern | Choice |
|---|---|
| Public site (library, portals, problem pages) | Astro (or plain SSG) + vanilla islands |
| Player / editor tools (TR, Studio Pro) | Stay vanilla, keep as-is |
| Authoring dashboard (if needed) | Small framework, separate app |
| Math rendering | KaTeX (fast, sync) — standardize; MathJax only if you need its feature set |

---

## 5. Mock → production gap analysis

1. **Data layer** — hardcoded arrays → §3 content repo + schema validation (zod or ajv in CI).
2. **One animation runtime** — every short today re-implements scenes + `onFrame()` (~200 lines ×2 per file). Extract a **shared player runtime**: you declare *scenes + keyframes* (JSON), the runtime interpolates and drives all elements. This is the single highest-leverage change: one debugged engine instead of thousands of copies.
3. **No build** — everything CDN. Tailwind CDN → build-time CSS (or drop it); fonts self-hosted; KaTeX served locally or from your origin.
4. **From 2 questions to 5,000 pages** — static generation from the repo; search becomes prebuilt index (pagefind/fuse); category chips and "Up Next" generated from `topics.json`; sitemap/RSS for SEO.
5. **Assets at scale** — render MP4s land in object storage (R2/S3/Backblaze) with CDN; repo stores code + metadata, not megabytes of video. Keep short WebM masters in LFS or storage.
6. **AI correctness** — math is hallucination-prone. Every AI-generated solution needs: human review step in the pipeline (status gates: `ai-draft → reviewed → scripted`), and machine-checkable steps where possible (SymPy verify for calculus/algebra; unit tests for code clips).
7. **Accessibility/i18n** — keyboard nav exists; add focus management in modals, alt text, captions for videos (YouTube auto-captions + your script = caption source).
8. **Publishing** — YouTube Data API v3: OAuth quota (default 10k units/day ≈ ~6 uploads/day; request more), throttled uploads, resumable sessions; thumbnail generation from the rendered first/last frame.

---

## 6. Workflow: question → AI → video → YouTube

```
 Repo question (index.md + solution.md)
        │
        ▼
 [1] AI solve      → solution.md draft          (human review gate)
        │
        ▼
 [2] AI script     → script.md  (8-12 beats)    (human review gate)
        │
        ▼
 [3] AI storyboard → storyboard.json            (single anim OR set of N clips)
        │                              │
        │            ┌─────────────────┘
        ▼            ▼
 [4] AI anim code → anim/clip-01.html|css|js  (Studio Pro or TR edit)
        │
        ▼
 [5] Render       → hic-modal (TR/design-gallery) or Studio Pro → MP4/WebM + PNG thumb
        │
        ▼
 [6] QA           → watch, check sync of narration vs scenes
        │
        ▼
 [7] Publish      → YouTube API upload + site page build (library card + portal entry)
```

**How it maps onto your existing tools:**

- **[1–3] Generation** — a small Node CLI (`iitm`):
  - `iitm new <subject> <file.md>` — scaffold question from template
  - `iitm solve <id>` — LLM → `solution.md` (status `ai-draft`)
  - `iitm script <id>` — LLM (fed the reviewed solution) → `script.md` with per-scene narration beats
  - `iitm storyboard <id>` — LLM → `storyboard.json` (scenes with timings matching script beats)
  - `iitm animate <id>` — LLM → per-scene HTML/CSS/JS clips using the **shared scene runtime** (§5.2), so every generated clip is compatible with the player and the exporters
  - Each step is idempotent + reviewable; gates keep humans in the loop for math correctness.
- **[4] Authoring** — the storyboard opens in **Studio Pro** (multi-clip) or **test-renderer** (single clip). Paste AI code via the AI tab or the code tab; iterate with Apply/reset; gallery for approved snippets.
- **[5] Render** — the **wall-clock WebM exporter** in hic-modal (committed `ee4d159`) is the render engine: deterministic pacing (150 frames ≈ 4966 ms clip ≈ 4965 ms wall), VP9 with fallback, sharp same-aspect PNG frames for thumbnails. For a full video (stitched clips + voiceover): export each clip's WebM, stitch with ffmpeg (`concat` demuxer) and mux TTS/human narration → MP4. Studio Pro renders the multi-clip sequence as one timeline.
- **[6] QA** — rendered file is attached to the question folder; reviewer watches once; status → `rendered`.
- **[7] Publish** — `iitm publish <id>`: uploads MP4 via YouTube Data API (title/description/tags generated from `index.md`), sets `youtube: <id>` in frontmatter, status → `published`; the site build then shows it in the library shelf + portal, replacing the current hand-written cards.

**Set-of-multiple-animations** (one question, several clips): `storyboard.json` holds an ordered clip list; each clip renders separately; publish concatenates. This matches Studio Pro's multi-preset model already.

---

## 7. Suggested build order

| Phase | Deliverable |
|---|---|
| **0. Schema + runtime (now)** | Freeze `index.md`/`solution.md`/`storyboard.json` schemas; extract the shared scene runtime (player engine + hic-modal integration); migrate the 2 existing problems as proof |
| **1. Static site** | Astro (or 11ty) build from repo → library + portal + problem pages generated; search + filters generated |
| **2. AI CLI** | `iitm solve/script/storyboard/animate` with review gates; run on 10–20 questions end-to-end |
| **3. Render + publish** | ffmpeg stitch + YouTube API upload + status flip; 3 real videos live |
| **4. Sheet layer** | Google Sheet as editorial queue synced to repo; bulk import of question backlog |
| **5. Dashboard** | Only if volume demands: small-framework review/batch UI over the same repo |

Phases 0–2 are pure local tooling (no accounts, no cost). Phase 3 needs a YouTube OAuth project; Phase 4 a Google Cloud project.

---

## 8. Open questions (your call, not blockers)

1. Voiceover: TTS (fast, cheap, soulless) vs human VO (you) vs captions-only?
2. Do portals stay per-subject static sites, or one app with routing over the repo?
3. YouTube channel branding — same channel for all subjects, or one per subject?
4. Who reviews AI solutions (you only, or contributors via PRs)?
