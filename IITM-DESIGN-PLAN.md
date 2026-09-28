# IITM Design Plan — porting the problem-page design system, corner to corner

Source of truth: `mocks/problem-1-two-queens-one-king (16).html`
(`file:///C:/Users/aryan/Downloads/problem-1-two-queens-one-king (16).html#part-next`).
Iteration 16 is a **full redesign** of the chrome, not a tweak — mock `(5)` (already in
`mocks/`) contains none of `appbar`, `bottom-nav`, `walk-ctl`, `snack`, `kbd-hint`,
`scrolled`, `nav-hidden`, `chip`, Google Sans Flex, or Roboto Mono. Everything below was
read off the file itself; the two viewport screenshots match it.

Target: `site/` — the Astro build — for **every surface** (library, subject portal, problem
page, and its two parts plus Up Next), so one token sheet and one app shell drive all of it.

## Progress

| Phase | State |
|---|---|
| **0 — tokens + type** | **done** — M3 roles + `--e1/--e2`, mock values, no font literal outside `:root` |
| **1 — app shell** | **done** — `AppBar` + `BottomNav`, scroll-spy, hairline, hide-on-scroll |
| **2a skeleton** | **done** — left-aligned hero + chip, `::after` section rules, Part-2 band deleted, 65ch measure |
| **2b solve surface** | **done** — borderless tonal cards, given card, solid step circles, math surfaces, flat answer card + badge, the duplicate "Answer" step removed from the content |
| **2c quiz · 2d walkthrough** | **done** — outlined options with key circles + primary state layer, lock-after-answer, live feedback bars; the walkthrough (reveal, dots, live count, Show all → Show answer → Restart, per-question persistence) |
| **3a produce layout + device chrome** | **done** — `minmax(320px,400px)` grid at 900px, tonal device card, aspect pill (+ `sessionStorage`), frame-only dark surface, progressive track with native range, 44px controls, mono timecode, tool row below the frame |
| **3b player interaction** | **done** — K/R shortcuts gated on visibility + typing + modifiers, `aria-keyshortcuts`, haptics, fine-pointer hint row, pointer/keyboard seek |
| **3c script + code drawer** | **done** — speech-bubble beats (scene marker split into the plan rows), Copy script, tertiary-container time chips, 64px summary + 180° chevron, tonal Copy all + per-language copy with label swap + the shared snackbar, theme-aware `pre` |
| **4 up next + resume** | **done** — left-aligned tonal card with no resting border/shadow, 96→80→64px square thumb, accent topic overline inside the card, hover `--e2`, `.btn text` library link; resume snackbar (per-question key, 7-day TTL, skipped for hashes and shallow positions) whose "Start over" resets the walkthrough |
| **5 library + portal** | **done** — tonal shelf cards with the M3 state layer, poster tones as classes, dashed placeholder tile, M3 search bar (pill + leading icon), assist chips on `--tertiary-container`, empty state on the `hidden` attribute; every inline `style=` and the last per-page `<style>` block removed |
| 6–7 | not started — **specified in `IITM-COMPONENT-SPEC.md`** |

`IITM-COMPONENT-SPEC.md` is the detail layer for phases 2–5: one section per component with
the mock's exact values, what the live build measures today, the required change, the
content-model edits it implies, and the acceptance test. Read it before implementing a phase;
it also lists the places where we deliberately do **better** than the mock.

Three notes from doing 0 and 1, for whoever picks up phase 2:

- The **1080px container now applies to the problem page too** (`.wrap-top` / `.wrap-produce` /
  `.wrap-upnext` moved off 1240px), so the app bar's content edge lines up with the page's.
- Two bugs the sticky bar introduced were fixed beyond the plan: (a) the refresh **settle-pin**
  snapped a `#hash` target to `top:0`, sliding the heading under the bar — it now pins to the
  computed `scroll-padding-top`; (b) the tablet rule that hides the bar title is scoped to
  `.back ~ .title`, because the library has no back control and its bar would have gone blank.
- The mock's `.nav-hidden .given` sidebar override was **dropped, not ported**: the bar only
  hides on phones (≤719px), where the solve grid is single-column, so at ≥900px the offset is
  constant. The mock's version misfires when the class survives a resize.

---

## 1. Why it reads "clean"

Six decisions do most of the work. They are the things to get right before touching detail.

1. **Borderless surfaces, grouped by fill + space.** The final pass in the mock explicitly
   strips borders: `.card,.device{border:0;background:var(--container)}`. Grouping is done
   with a tonal fill one step off the page and generous rhythm, not with boxes-in-boxes.
   Borders survive in exactly two places, both of which mean "interactive": `.opt` (quiz
   options) and `.lang` (code blocks).
2. **Three surface tones, one page tone.** `--bg` / `--container` / `--surface` plus
   `--container-hi` for a nested element *inside* a card. Nothing invents its own grey.
3. **One accent per part.** Part 1 is green (`--primary`), Part 2 is gold (`--accent` /
   `--tertiary`) — the overline colour, the `h2` underline rule, the try-card edge, the
   plan-time chips, the Up Next overline, and the progress bar all switch together.
4. **Serif for display, sans for everything functional, mono for data.** Literata headings
   against Google Sans Flex UI text is what makes it look editorial rather than "admin
   panel".
5. **Elevation is reserved.** At rest, cards have *no* shadow. `--e1` appears on buttons on
   hover, `--e2` on the Up Next card on hover and on the snackbar. The only always-on
   shadow in the whole page is the dark animation frame inside the player.
6. **Hairlines only when they carry information.** The app bar has no bottom border at
   rest; JS adds `html.scrolled` and the hairline appears once content slides under it.
   Given-rows keep dividers at 55% opacity and drop the last one.

---

## 2. Color

### 2.1 Roles (Material 3 naming is used literally in the source)

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--bg` | `#f5f4ee` | `#0f1512` | warm paper / deep green-black |
| `--surface` | `#fdfcf9` | `#161d19` | raised, used for code `pre` |
| `--container` | `#eeece3` | `#1b2420` | the default "card" fill |
| `--container-hi` | `#e4e1d4` | `#263029` | one step up, nested inside a card |
| `--on-surface` | `#1b1f1c` | `#edf1ec` | body ink |
| `--on-variant` | `#5c665f` | `#93a29a` | secondary ink |
| `--outline` | `#8d8f80` | `#6f7d75` | interactive borders (`.opt`) |
| `--outline-var` | `#dcd8c8` | `#2c362f` | dividers, quiet borders (`.lang`) |
| `--primary` | `#12523f` | `#4dc397` | Part 1 accent, active states |
| `--on-primary` | `#fdfcf9` | `#0c110e` | ink on primary |
| `--primary-container` | `#cfe8db` | `#14503c` | goal box, answer card, active tab |
| `--on-primary-container` | `#08281e` | `#b9f0d8` | ink on primary-container |
| `--tertiary` / `--accent` | `#8a6508` | `#e7ba55` | Part 2 accent, Up Next overline |
| `--tertiary-container` | `#f6e4b4` | `#4a3808` | hero chip, plan-time chips |
| `--on-tertiary-container` | `#3a2900` | `#f6dc9c` | ink on tertiary-container |
| `--error` / `--error-container` | `#a3223c` / `#f8d9dd` | `#ef6b7d` / `#5a1424` | wrong quiz answer |
| `--success` / `--success-container` | `#12523f` / `#cfe8db` | `#4dc397` / `#14503c` | right quiz answer |

### 2.2 What the site has today (`site/src/styles/site.css`)

Aliases exist for most of it under different names: `--surface-alt` = `--container`,
`--text` = `--on-surface`, `--text-dim` = `--on-variant`, `--border` ≈ `--outline-var`,
`--rule`, `--primary-strong`, `--accent-strong`, `--danger`.

Gaps and drift to close:

- Missing entirely: `--container-hi`, `--primary-container`, `--on-primary`,
  `--on-primary-container`, `--tertiary-container`, `--on-tertiary-container`,
  `--success*`, `--error-container`, `--outline`, `--e1`, `--e2`.
- `--border` is `#e1ded1`; the mock's quiet border is `#dcd8c8` → adopt the mock value.
- `--accent` is `#a8790a`; mock `--accent` is `#8a6508` → adopt the mock value.
- Quiz colours are hardcoded (`#3f9d72`, `rgba(63,157,114,0.12)`, `#c0324b`) instead of
  roles → move to `--success` / `--success-container` / `--error` / `--error-container`.
- One `--shadow` stands in for two elevation levels → replace with `--e1`/`--e2`
  (`0 1px 2px rgba(0,0,0,.14), 0 1px 3px 1px rgba(0,0,0,.08)` and its `.08` variant;
  dark uses `.5`/`.35`), keeping `--shadow` as an alias during migration.
- Answer card is a green→gold *gradient*; the mock is a flat `--primary-container` block.
- Active stepper dot hardcodes `#fdfcf9`; that is exactly `--on-primary`.

### 2.3 State layers (the M3 idiom the page leans on everywhere)

Hover states are *not* colour swaps — they are translucent overlays of the ink colour over
whatever surface is underneath:

```
icon-btn hover   color-mix(in srgb, var(--on-surface) 8%, transparent)
tab hover        color-mix(in srgb, var(--on-surface) 7%, transparent)
opt hover        color-mix(in srgb, var(--primary)  8%, transparent)
tab active       background: var(--primary-container)
code summary hover  color-mix(in srgb, var(--on-surface) 5%, transparent)
given divider    color-mix(in srgb, var(--outline-var) 55%, transparent)
```

Port these verbatim (they are already written in modern `color-mix`, which the codebase
already uses for scrollbars and the goal box).

### 2.4 Theme handling

The mock boots the theme with a synchronous `<head>` script reading
`localStorage['theme']`, falling back to `prefers-color-scheme`, and sets `data-theme` before
first paint. **The site already does this better** — same shape, but keyed on `hic_theme`
(shared with the studio pages), with `theme-color` meta updated and cross-tab `storage`
sync. Keep the site's version; only add `color-scheme: light dark` parity and `<meta
name="color-scheme">`.

---

## 3. Typography

| Role | Family | Size | Weight | Notes |
|---|---|---|---|---|
| Body | Google Sans Flex → Roboto → system | `1rem/1.6` | 400 | `-webkit-font-smoothing: antialiased` |
| Hero `h1` | Literata | `clamp(2.1rem,6vw,3.5rem)`/1.1 | 600 | `letter-spacing:-.015em` |
| Section `h2` | Literata | `clamp(1.6rem,4vw,2.25rem)`/1.2 | 600 | `::after` = 52×3px rule in part accent, `margin-top:12px` |
| Card/step `h3` | Literata | `1.15rem` | 600 | |
| Overline | sans | `.75rem` | 500 | `letter-spacing:.1em; text-transform:uppercase`, colour = part accent |
| App bar title | Literata | `1.05rem` | 600 | hidden 720–1023px |
| Chip / tab / button | sans | `.8125–.9rem` | 500 | |
| Mono data | Roboto Mono | `.72–.8rem` | 400/500 | step labels, plan times, timecode, `.pill` |
| Numerals | Literata | `.val 1.8rem` | 600 | answer value |

Site drift: the site ships **Inter + JetBrains Mono**. The mock ships **Google Sans Flex +
Roboto Mono**. Because "Google Sans Flex" is a Google Fonts family with a limited static
set, load it as the mock does (`family=Google+Sans+Flex:wght@400;500;600`) with
`'Roboto'` next in the stack; Roboto Mono replaces JetBrains Mono. This touches
`Base.astro` (the `<link>`) plus every `font-family` literal in `site.css`,
`ThemeToggle.astro`, and `[subject]/index.astro` — do it as a search-and-replace sweep,
then set the families once as `--sans` / `--serif` / `--mono` variables so future edits
never hand-write a family again (the site currently hardcodes `'Inter'`/`'JetBrains Mono'`
in ~20 rules).

The `52px × 3px` rule under `h2` is worth calling out: the site approximates it with
`border-bottom` on an `inline-block` heading. Move to the mock's `::after` pseudo-element
so the rule has a fixed width independent of the heading text and can take a different
colour in Part 2 without duplicating rules.

---

## 4. Shape, elevation, spacing, motion

**Shape scale** — 8px (chip, snackbar), 14px (options, math, goal, script bubble, thumb,
lang block), 20px (cards, Up Next), 24px (answer, device), 999px (pill buttons, badges,
tabs, back pill). Script bubbles use `border-radius:14px` with `border-top-left-radius:4px`
— a speech-bubble tail, not a uniform box.

**Elevation** — 0 at rest for cards; `--e1` on filled/tonal button hover; `--e2` on Up Next
hover and the snackbar.

**Spacing rhythm** — everything is `clamp()`-based, so there are no magic breakpoints:

| Thing | Value |
|---|---|
| Container | `max-width:1080px`, `padding:0 clamp(16px,4vw,32px)` |
| Hero | `padding-top:clamp(32px,6vw,56px)` |
| Section | `padding:clamp(40px,7vw,72px) 0 8px` |
| Card padding | `clamp(18px,3vw,28px)` |
| Prose measure | `65ch` (site currently `58–62ch`) |
| Head sub measure | `46rem` |
| Up Next | `40px 0 64px` |

The site's page wraps are `1240px` (`.wrap-top`, `.wrap-produce`, `.wrap-upnext`) and
`1080px` (`.wrap`). Collapse to one `1080px` container — the narrower column is what makes
the 65ch prose and the 300px sticky sidebar feel right.

**Motion** — `0.15s` for state, `0.2–0.28s` for chrome (app bar transform, tabs top,
aspect-ratio), `0.35s` `reveal` keyframe (`opacity 0→1`, `translateY(12px)→none`) for
walkthrough steps; `easeOutCubic` for the animation timeline and a small back-ease overshoot
for the answer highlight. `@media (prefers-reduced-motion:reduce)` kills all transitions
and forces `scroll-behavior:auto`.

**Focus** — `:focus-visible{outline:3px solid var(--primary);outline-offset:2px;border-radius:8px}`.
Copy it; it is the visible cue for the keyboard shortcuts and the segmented tabs.

---

## 5. App shell

This is the biggest structural change and the thing that makes the page feel like an app.

### 5.1 Top app bar

- Sticky `top:0`, `z-index:50`, `background:color-mix(in srgb,var(--bg) 88%,transparent)`
  with `backdrop-filter:blur(12px)` — M3 "surface with backdrop tint".
- Height `64px`; on ≥720px a 3-track grid `1fr auto 1fr`: `[back + title] [tabs] [theme]`.
- Back control: 44×44 circular icon button under 720px; between 720–1023px it becomes a
  **"Library" pill** (40px tall, radius 999, label shown, 20px arrow) because the title is
  hidden there; ≥1024px it goes back to an icon button with the page title next to it.
- No bottom border at rest. JS toggles `html.scrolled` at `scrollY > 4` and the hairline
  (`--outline-var`) fades in — the M3 "elevate on scroll" behaviour, done without shadow.
- Phone-only: `html.nav-hidden` translates the bar `-100%` when scrolling down >6px, back
  in on scroll up (<80px always shows it). Disabled ≥720px.
- Tabs live *inside* the bar on ≥720px as a **segmented, pill-shaped container**
  (`background:var(--container)`, `padding:4px`, `gap:2px`): 36px tall pills, 16px inline
  padding, active = `--primary-container` on `--on-primary-container`.

Site today: a `position:fixed` `.back-float` pill at top-left, a `position:fixed`
`ThemeToggle` at top-right, and a home-grown centred `.part-stepper` (outlined dots +
connector line) in the page flow. Replicating means **deleting** `.part-stepper`,
`.stepper-*` and the two floating elements, and introducing an `AppBar.astro` plus
`BottomNav.astro`, with the theme button as the bar's trailing icon.

### 5.2 Bottom navigation (phones)

`<720px` the tabs disappear and a fixed 3-item bar appears (`Solve`, `Build`, `Up next`):
52px min-height items, 26px stroke icons at `stroke-width:1.7`, active item gets the filled
path (`.fl`) plus a `.cut` painted in `--bg` so the glyph reads as two-tone, `body` gets
`padding-bottom:calc(96px + env(safe-area-inset-bottom))`, and the snackbar lifts to 100px.
The bottom-nav/segmented-tab duality is one `data-tab="solve|produce|next"` attribute driven
by one scroll-spy, which is worth keeping exactly as-is.

### 5.3 Hero

`chip` (tertiary-container, 32px, radius 8) → `h1` → one-line description (`max-width:44rem`,
`--on-variant`). The site already has the equivalent header (kicker/h1/source) but left
aligned and without the chip; the mock centres nothing — it is a left-aligned hero inside
the container, which is calmer than the current centred `.wrap-top .page-head`.

### 5.4 Snackbar

One shared component: fixed bottom-centre, `translate(-50%,120px)` → `translate(-50%,0)`,
`background:var(--on-surface); color:var(--bg)`, radius 8, `--e2`, max-width
`calc(100vw - 32px)`, optional action button in `--primary-container`. Two uses: "Copied to
clipboard" and "Picked up where you left off → Start over".

---

## 6. Part 1 — "Work the problem"

- **Section head**: overline "PART 1" (primary) + `h2` + 52×3 rule + sub (46rem).
- **Try-it card**: tonal `--container`, radius 20, `border-left:3px solid var(--accent)`, no
  other border. Overline in `--tertiary`. Options grid `repeat(2,minmax(0,1fr))`, gap 12, → 1
  column ≤719px. Each `.opt`: **transparent** background, `1px solid var(--outline)`, radius
  14, `min-height:56px`, a 28px `--container-hi` key circle (A/B/C/D) and a state-layer
  hover (primary 8% + primary border). Correct = `--success-container` with
  `--on-primary-container` ink and 500 weight; incorrect = `--error-container`. Feedback is
  a filled bar (`--success-container` / `--error-container`), not coloured text.

  Site today: options are `--surface-alt` filled with a border, hover only recolours the
  border, and feedback is coloured text. The mock version is noticeably more M3 and needs
  the `.k` key circle to exist in the markup (derive from `o.id`).

- **Solve grid**: `minmax(0,1fr)` → `300px minmax(0,1fr)` at **900px** (site uses `280px` at
  900px — close, adopt 300). Sidebar `position:sticky` with a top offset that accounts for
  the bar (`88px + safe-area`), reduced when the bar is hidden (`24px + safe-area`).
- **Given card**: tonal, radius 20, label rows as `flex` `dt`/`dd` pairs with
  `justify-content:space-between`, dividers `color-mix(… 55%)` and none on the last row
  (site uses dashed rules — the mock's solid 55% is cleaner). Value right-aligned, 500.
  `dd` may contain math. Compare: site currently does `grid-template-columns:5.2rem 1fr` on
  the row; the mock's space-between handles long values better and drops the fixed gutter.
- **Goal box**: filled `--primary-container`, radius 14, `small` overline at 0.8 opacity,
  1.15rem value (site: 11% tint + border — switch to the flat container role).
- **Steps**: 40px **solid** `--primary` circle with `--on-primary` numeral, grid
  `40px minmax(0,1fr)` gap 16; connector is a per-step `::before` (`left:19px; top:44px;
  bottom:4px; width:2px; background:var(--outline-var)`), suppressed on the last step and on
  hidden walkthrough steps. Site uses a single global `.steps::before` line and *outlined*
  numerals; the solid circles plus per-step connector are what make the timeline look
  intentional when steps are hidden one at a time.
- **Math**: `--container` (inside the borderless solution card), radius 14, `8px 16px`,
  horizontal scroll, `katex-display` margins preserved. The site already guards overflow —
  keep those guards.
- **Answer**: flat `--primary-container`, radius 24, `20px 24px`, `small` overline at 0.8
  opacity, `.val` 1.8rem Literata 600, plus a 36px **primary pill badge** ("✓ Matches option
  A"). This replaces the current gradient card + coloured text.
- **Walkthrough** (new behaviour): all steps + answer start hidden; a `.walk-ctl` strip
  (`--container`, radius 16) holds 8px dots (active = primary, `scale(1.25)`), a live count
  ("Step 2 of 3", `role=status aria-live=polite`), a text "Show all", and a filled
  "Next step →" button that relabels to "Show answer" then "Restart". State persists in
  `localStorage['walk-step']`; each reveal re-triggers the `reveal` keyframe;
  `scrollIntoView({block:'nearest'})` follows the new content; the last visible step is
  marked `.linked`. On refresh the saved step is restored (capped at `total+1`).

  Decision to make while porting: the site's current behaviour is "everything visible,
  IntersectionObserver highlights the active stepper dot". The mock's is "reveal one at a
  time, remember where you were". They are compatible — keep both, but the walkthrough
  becomes the default on the problem page since the app-bar tabs already communicate
  progress.

---

## 7. Part 2 — "Build the short"

- **Section head** switches to the gold accent (overline, rule, plan chips, progress bar).
- Site currently wraps Part 2 in a full-bleed `.zone-produce` band (`--surface-alt` with top
  and bottom rules). The mock has **no band** — Part 2 is the same page tone as Part 1,
  separated only by the section's own rhythm. Removing the band is a one-line deletion and
  immediately makes the two parts feel like one page.
- **Produce grid**: `minmax(320px,400px) minmax(0,1fr)` at **900px** (site: `1.15fr/0.85fr`
  at 1024px). The fixed-ish player column is the important part: the 9:16 frame must not
  resize with the text column.
- **Device chrome**: `--container` card, radius 24, padding `8px 8px 12px`, no shadow. Bar
  with mono label "Animation preview" on the left and an aspect-toggle pill on the right
  (36px, radius 999, `--container-hi`, mono `.76rem` label `9:16`/`16:9`,
  `aria-pressed`). The dark stage itself stays `#0e1512`, radius 14 — but **keep the site's
  canvas player** (`hic-frame` `HicRenderer`), which is parity with test-renderer and can
  export; the mock's DOM `scene` timeline is not worth porting.
- **Player controls**: 4px `--container-hi` track (with a 12px primary dot on the progress
  bar, hidden at idle), 44×44 circular transparent play/reset buttons with 30px glyphs and
  a state-layer hover, mono timecode `0:00 / 0:15` with a dim total, pointer **and** keyboard
  seeking (arrows ±1s) on a `role="slider"` track, `data-state="idle|playing|paused|done"`
  driving which glyph shows, `navigator.vibrate(12)` on play / `(8)` on restart, and a
  `K play/pause · R restart · ←/→ seek` hint row shown only `@media(hover:hover) and
  (pointer:fine)`. Shortcuts are gated behind an IntersectionObserver on the player and
  suppressed while typing in inputs; `aria-keyshortcuts` is set on the buttons.
- **Script sheet**: each beat is a `--container` bubble, radius 14 with a 4px top-left tail,
  `12px 16px`. Site renders the same beats italic serif inside one accent-ruled block —
  switch to bubbles (and consider a "Copy script" outlined button in the head, which the
  mock has and the site does not).
- **Visual plan**: mono `time` rendered as a `--tertiary-container` chip (radius 8) in a
  `72px 1fr` grid. Site currently shows times as plain accent mono text.
- **Code card**: `<details>` with 64px `min-height` summary, state-layer hover, 24px chevron
  rotating 180°, hint text hidden ≤719px. Inside: one note line, then per-language blocks —
  a `--container` head strip with a mono `.pill` and a copy button, and a `pre` on
  `--surface` (`max-height:320px`, `--on-surface` ink, `.8rem/1.6` mono).
  Note the deliberate difference: **the mock's code blocks follow the theme** (light code on
  light ground). The site's are always dark `#0c110e`. Adopting the mock's behaviour is a
  visible "cleaner" win; if dark code is preferred, keep it and say so — but make it a
  decision, not an accident.
- **Copy affordances**: label-swap pattern (`.lbl-default` ↔ `.lbl-copied` toggled by a
  `.copied` class) plus the snackbar. Buttons: filled (Play), tonal (copy-all), outlined
  (per-language copy, 36px), text (Show all). The site already has this pattern for
  `#btn-copy-code` — generalise it into `.btn` variants (`.btn.filled/.tonal/.outlined/.text`)
  so future buttons inherit the shape scale instead of re-declaring heights.

---

## 8. Up Next (`#part-next`)

- Plain `.next` block: `40px 0 64px`, overline "Up next" in `--accent`, no band.
- Card: `--container` (not `--surface`), radius 20, padding 12, `display:flex; gap:16px`,
  mono `t` overline (accent) → `n` title (1.2rem Literata) → `s` sub (`--on-variant`).
  Hover adds `--e2` only.
- Thumb: **96×96 square**, radius 14, `#0e1512` ground, mono `.7rem` `#93a29a` line above a
  `#e7ba55` 1.15rem value; 80×80 ≤719px. The site's current thumb is a 92px 9:16 poster and
  its card carries a border + shadow at rest plus a custom arrow button. The mock's version
  is flatter and squarer — adopt it, and note the site's arrow affordance can stay as an
  extra if desired, but the mock has none (the whole card is the link).
- Below the card: a text button back to the library.

---

## 9. Responsive behavior — the full matrix

| Width | What changes |
|---|---|
| `≤379px` | Up Next wraps (poster above, title + arrow below) — site-only rule, keep |
| `≤559px` | `.try-options` → single column |
| `≤719px` | Tabs hidden, **bottom nav shown**; hero padding-top 32; `.row` wraps with left-aligned `dd`; code hint hidden; card paddings 16px inline; Up Next thumb 80px; `body` bottom padding 96px + safe-area; snackbar lifted; app bar hide-on-scroll enabled; section paddings reduced |
| `720–1023px` | App bar becomes 3-track grid; tabs become the pill segmented control; page **title hidden**, back control becomes the "Library" pill |
| `≥900px` | Solve grid 300px + 1fr, sidebar sticky; produce grid 320–400px + 1fr |
| `≥1024px` | App bar back returns to an icon button with the title visible |
| `hover:hover`+`pointer:fine` | Keyboard-hint row visible |
| `prefers-reduced-motion` | All transitions off, smooth scroll off |
| any | `viewport-fit=cover` + `env(safe-area-inset-*)` on all four edges; `html{scroll-padding-top:calc(72px + safe-area)}` so in-page anchors clear the sticky bars; `html,body{overflow-x:clip}` |

Verification widths to actually look at: **360, 414, 560, 719/720, 900, 1024, 1440**, each in
light **and** dark.

---

## 10. Material 3 lineage map

| In the mock | M3 component / token family |
|---|---|
| `.appbar` + `html.scrolled` hairline | Small top app bar, scroll-elevation behavior |
| `.tabs` pill container / `.bottom-nav` | Segmented button (desktop) ↔ Navigation bar (mobile) |
| `.chip` | Assist chip |
| `.opt` A/B/C/D rows | Radio-style list item with state layer + error/success roles |
| `.goal`, `.answer` | Filled "primary container" emphasis surface |
| `.btn` filled / tonal / outlined / text | Filled / Filled tonal / Outlined / Text buttons |
| `.badge` (36px pill) | Badge / assist pill |
| `.progress-track` + `#progress-bar` | Linear determinate progress indicator (4px) + slider track |
| `#snack` + `.snack-act` | Snackbar with action |
| `.walk-dots` | Expressive stepper/progress dots |
| `.goal small`, `.overline`, `.try-badge` | Overline label role |
| `--e1` / `--e2` | Elevation levels 1 and 2 (two-layer key+ambient shadow) |
| `color-mix(… 5–8%)` hovers | State layer (hover) |
| `:focus-visible` 3px outline | Focus indicator |
| `env(safe-area-inset-*)` | Edge-to-edge / window insets |
| `navigator.vibrate` on play/reset | Haptic feedback |
| `.kbd-hint` + `aria-keyshortcuts` | (M3 has no equivalent — a nice extra) |

---

## 11. Replication plan

Ordered so each phase is independently shippable and verifiable. Phases 0–2 alone fix ~80%
of the visual gap on the problem page.

### Phase 0 — Tokens and type (`site/src/styles/site.css`, `layouts/Base.astro`)
1. Add the full M3 role set (§2.1) and `--e1`/`--e2`; keep old names as aliases
   (`--surface-alt`, `--text`, `--text-dim`, `--border`, `--shadow`) so no rule breaks
   mid-migration; then migrate rules to the new names and delete the aliases.
2. Align drifted values: `--border` → `#dcd8c8`, `--accent` → `#8a6508`.
3. Replace hardcoded quiz colours with `--success*` / `--error*`.
4. Swap the font stack (Google Sans Flex + Roboto + Roboto Mono) in `Base.astro` and
   everywhere a family is hardcoded; then reference only `var(--sans/--serif/--mono)`.
5. Add `--sans/--serif/--mono`, container (`1080px` + `clamp(16px,4vw,32px)`), section
   padding and prose-measure (65ch) variables.

**Done when:** light/dark values match the mock's table exactly; no `font-family` literal
outside the `:root` block; `npm run build` passes.

### Phase 1 — App shell (`AppBar.astro`, `BottomNav.astro`, `Snackbar` helper)
1. Build the app bar (grid, backdrop blur, back/title/tabs/theme, scrolled hairline,
   phone-only hide-on-scroll).
2. Add the bottom nav; wire both to one scroll-spy on `data-tab`.
3. Move `ThemeToggle` into the bar (keep `hic_theme` + `theme-color` + storage sync).
4. Delete `.back-float`, `.part-stepper`, `.stepper-*` and their markup.
5. Add `viewport-fit=cover`, `scroll-padding-top`, safe-area padding to `Base.astro`.

**Done when:** all three pages show the bar; ≤719px shows the bottom nav and no tabs;
720–1023px shows the "Library" pill and hides the title; tabs/bottom-nav highlight follows
the scroll position; refresh anywhere on the page produces no theme flash and no scroll
animation.

### Phase 2 — Part 1 (`pages/[subject]/[id].astro` markup + `site.css`)
Hero + chip, section heads with the `::after` rule, borderless card system, try card with
key circles + container-role feedback, given card with space-between rows, goal box on
`--primary-container`, solid step circles with per-step connectors, flat answer card + badge
pill, and the walkthrough control (with `localStorage` persistence, dots, live count,
Show all / Next step / Show answer / Restart).

**Done when:** the Part 1 column matches the mock at 1440 and 360; stepping through all
three steps then the answer works with keyboard only; a refresh in the middle restores the
same step; the sidebar sticks and releases correctly with the bar visible and hidden.

### Phase 3 — Part 2
Remove the `.zone-produce` band; retune the produce grid to 900px/320–400px; restyle the
device chrome (aspect pill, 4px track + dot, 44px round controls, mono timecode, kbd hint,
haptics) around the existing canvas player; add keyboard/pointer seeking; script bubbles +
"Copy script"; plan-time chips; restyle the code card (theme-aware `pre`, lang head strip,
outlined copy buttons); generalise `.btn` variants.

**Done when:** play/pause/restart/replay/seek all work by mouse and keyboard, the 9:16↔16:9
toggle does not reflow the text column, copy buttons show the label swap + snackbar, and the
page still has zero horizontal scroll at 320px with KaTeX present.

### Phase 4 — Up Next + resume
Square 96px thumb, flat `--container` card with `--e2` hover, accent overline, library text
button; add the "Picked up where you left off → Start over" snackbar (skip when a hash is
present or `y < 500`, 7-day TTL), which must call the walkthrough reset when dismissed.

**Done when:** `#part-next` matches the mock; scrolling into the page, reloading, and hitting
"Start over" returns to the top with the walkthrough reset to step 1.

### Phase 5 — Library + subject portal
Bring `index.astro`, `[subject]/index.astro`, `ShortCard.astro` and the chips into the same
system: bar with title only on the library, tonal shelf cards with the M3 state layer,
assist chips for topics (`--tertiary-container` when active rather than raw `--accent`), and
the search input restyled as an M3 search bar (pill, `--container`, leading icon) instead of
the current inline-styled `input`. Fold the inline styles on the portal page into `site.css`
— it is the last page carrying `style="…"` everywhere.

**Done when:** library, portal and problem page share one token set and one bar, with no
inline style attributes and no per-page `<style>` blocks except intentional local ones.

### Phase 6 — A11y, motion, polish
`:focus-visible` everywhere; `aria-live` on try-it feedback, walk count and snackbar;
`aria-keyshortcuts`; `aria-pressed` on the aspect toggle; `role="slider"` on the track;
44px minimum touch targets; `prefers-reduced-motion` honoured; contrast spot-check on
`--on-variant` over `--container` in both themes; keyboard-only pass over the whole page.

### Phase 7 — Verification
`node tools/validate.mjs`; `cd site && npm run build`; then the visual matrix from §9 in
both themes; no-horizontal-scroll check at 320/360; theme-flash check on first paint;
scroll-restoration check (hash + no hash); keyboard walkthrough of every interactive
element. Record results in the commit body.

---

## 12. Content / store gaps this surfaces

- **Hero description**: the mock's hero `p` is a one-line pitch. The site uses `d.source`
  ("Original (joint probability of a 4-card draw)"), which reads like a citation. Either add
  a `summary:` frontmatter field (recommended — it's the line social/SEO also wants) or
  compose one from topic + difficulty.
- **Chip text**: mock = `Joint probability · Card draws` = `topic · difficulty` — already
  derivable from frontmatter (`kicker` in `[id].astro` does exactly this).
- **Up Next text**: mock's thumb is a tiny textual poster (`A(1,2) B(2,3)` / `4 / 4`), which
  is what `lib/posters.js` already produces — just needs the square frame.
- **`og:image` 404**: `pq-001/index.md` points at `meta-src/pq-001-og.png`, which does not
  exist. Fix while touching frontmatter (or point at `og-default.png`).
- **Walkthrough persistence key**: use a per-question key (or clear on question change) so
  step 3 of one problem doesn't pre-open step 3 of the next.

---

## 13. What NOT to copy

- **`scroll-behavior:smooth` on `html`.** The mock has it; the site deliberately does not,
  because the browser's scroll *restoration* then animates from the top on refresh. Keep the
  site's `auto` + JS-smooth-anchors + settle-pin.
- **`localStorage['theme']`.** The site shares `hic_theme` with the studio pages.
- **The DOM `scene`/`#animation-container` player.** The site renders the storyboard through
  `hic-frame`'s `HicRenderer` into a canvas — same engine as test-renderer, exportable.
  Port the *chrome* around it, not the engine.
- **The duplicated KaTeX CDN tags / inline `<script type="text/plain">` code payloads.**
  The site compiles code from `storyboard.json` at build time; the mock hardcodes it.
- **`#snack` as a raw `div` with imperative DOM.** Build it once and reuse.
- **The mock's `--sans` fallback chain without `system-ui`-first safety** and its lack of
  custom scrollbars — the site's slim themed scrollbars are a keeper.

---

## 14. Acceptance summary

The port is "corner to corner" when, at every one of the §9 widths and in both themes:
colours come only from §2.1 roles, type only from §3, shape only from the §4 scale, no card
draws a border except an input-like control, no card has a resting shadow, Part 1 is green
and Part 2 gold, the bar/nav/spy/hairline behave, the walkthrough persists, the player plays
and seeks from the keyboard, and the page never scrolls horizontally.
