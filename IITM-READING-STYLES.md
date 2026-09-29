# IITM Reading Styles — decision record

**Status:** decided, not built. **Implementation plan:** `IITM-DESIGN-PLAN.md` §11 Phase 9
(that section is authoritative for the step-by-step and the CSS). This file is authoritative for
*why*: what the two styles are, how they differ, and what the user-facing control promises.

---

## 1. The two styles

The site ships **two reading styles** behind a header toggle, orthogonal to light/dark:

| | `data-style="warm"` (default) | `data-style="crisp"` |
|---|---|---|
| Reference | `mocks/problem-1-two-queens-one-king (16).html` | `mocks/problem-1-two-queens-one-king (10).html` |
| Character | warm paper, serif display, borderless tonal surfaces, gold Part-2 accent | cool white surfaces, hairline borders, sans display, green accent everywhere |
| Reads like | an editorial feature | a document / reference page |
| Notion | soft, low-contrast, "designed" | high-contrast, plain, "printed" |

`warm` is what the site renders today; `crisp` is the mock (10) baseline (see §2). The label pair in
the UI is *Warm* / *Crisp*; the attribute values appear in exactly one place per rule, so renaming is
a find-and-replace.

## 2. Why this is cheap: (10) is the baseline, (16) is the extension

The two mocks are not rivals. (16)'s `<style>` block (400 lines) **contains** (10)'s (315 lines);
the 113-line diff runs essentially one way. (16) appends four passes, each commented in its own
source:

1. `/* Identity: serif headings + warm gold accent */` — introduces `--serif` (Literata) on
   `h1,h2,h3,.appbar .title,.answer .val,.goal div,.upnext .n`, and a separate `--accent` gold.
2. `/* ---- Borderless pass: group with fill + space; borders only where they signal something ---- */`
   — `.card,.device{border:0;background:var(--container)}`, transparent solution card.
3. `/* Nested surfaces sit one tonal step above their card */` — `.math`, script bubbles and
   `.lang-head` move to `--container-hi`.
4. `/* Cleaner header: "Library" pill + segmented section switch */` — the section switch moves from
   a sticky in-page tab strip into the app bar as a secondary pill.

Plus two smaller moves: `#progress-bar` goes from `--primary` to `--accent`, and the phone tier
widens from 640px to 719px.

So `crisp` is not a design to be built — it is the same skeleton with those passes subtracted. That
is the whole reason this is a small phase rather than a second stylesheet.

### Axis by axis

| Axis | (10) `crisp` | (16) `warm` (today) |
|---|---|---|
| `--bg` / `--surface` / `--container` (light) | `#f8faf8` / `#ffffff` / `#eef3f0` | `#f5f4ee` / `#fdfcf9` / `#eeece3` |
| `--container-hi` (light) | `#e3ebe6` | `#e4e1d4` |
| `--on-variant` / `--outline` / `--outline-var` (light) | `#404943` / `#707972` / `#c0c9c2` | `#5c665f` / `#8d8f80` / `#dcd8c8` |
| `--primary` (light / dark) | `#006c50` / `#6ddbb1` | `#12523f` / `#4dc397` |
| `--bg` / `--surface` / `--container` (dark) | `#101412` / `#171d1a` / `#1c2320` | `#0f1512` / `#161d19` / `#1b2420` |
| `--tertiary` / `--tertiary-container` (light) | `#7a5900` / `#ffdea0` | `#8a6508` / `#f6e4b4` |
| `--error` (light / dark) | `#ba1a1a` / `#ffb4ab` | `#a3223c` / `#ef6b7d` |
| `--accent` | does not exist — progress bar and Part 2 are `--primary` | gold `#8a6508` / `#e7ba55` |
| Display type | none: no `--serif`, Google Sans Flex throughout | Literata on every heading and value |
| Card | `--surface` white + `1px solid var(--outline-var)`, radius 20 | borderless `--container`, radius 20 |
| Solution card | keeps its box (bordered surface) | transparent, padding 0 |
| `.section-head h2::after` marker | absent | 52×3px rule, `--primary` (Part 1) / `--accent` (Part 2) |
| Try card | no left rule | `border-left:3px solid var(--accent)` |
| App-bar hairline | always on | only once content scrolls under it |
| Section switch | sticky in-page tab strip, mono `1`/`2`, 3px primary underline | segmented pill in the app bar |
| Phone tier | `max-width:640px` | `max-width:719px` |
| Step-3 formula | two `$$` blocks in one `.math` box, `≈ 0.0039006…` | — (our content: one `aligned` pair, `≈ 0.0039`) |

## 3. The decision

- **Two orthogonal axes, not four themes.** Light/dark stays `data-theme` / `hic_theme`; reading
  style is `data-style` / `hic_style`. Both live on `<html>`, both are set by the inline head boot
  before first paint, both persist. A reader who wants dark + crisp gets it, and neither toggle
  costs a menu.
- **Style owns its own light and dark token sets**, so `[data-style="crisp"][data-theme="dark"]` is
  a complete block. The cascade order in `site.css` matters: the crisp dark block must follow the
  crisp light block.
- **`--accent: var(--primary)` inside crisp** is the single highest-leverage line — it retargets the
  entire gold Part-2 identity to green with no call-site edits. The gold *is* what "warm" means.
- **Default for a first-time visitor comes from `prefers-contrast: more`.** A reader whose OS already
  asks for more contrast is exactly the reader crisp's white surfaces and hairlines exist for.
  Otherwise the default is `warm` — no silent redesign for existing users.
- **The control is a two-state button, not a menu.** It sits beside the theme toggle in the app bar,
  uses `aria-pressed`, and names the current value in its label ("Reading style: Warm") so the state
  is announced rather than read off a glyph.

## 4. Deliberate deviations from mock (10)

1. **One phone tier (719px), not two.** (10) switches at 640. Forking the breakpoint per style would
   move BottomNav's threshold and the option grid's column count, making the shell unpredictable for
   no visual gain.
2. **Fix (10)'s anchor bug rather than copy it.** (10) keeps `scroll-padding-top:72px` while adding a
   ~50px sticky tab strip, so `#part-produce` lands *under* the strip. Under crisp the padding must
   grow to clear the bar plus the strip, and it must stay readable by the settle-pin in `Base.astro`,
   which parses `scroll-padding-top` off the root (it already does).
3. **No `.script-sheet p:last-child` accent bubble.** Present in the older
   `problem-2-vector-check (3).html` generation; the sheet is uniform by design now
   (Phase 8a) and one accent bubble would fight it.

## 5. What must not fork

Only presentation switches. The player, the walkthrough state machine, the quiz lock, the resume
snackbar, the clipboard handlers, the KaTeX pipeline and everything under `content/` are
style-independent and stay single-source. A `[data-style]` selector in a behavioural rule is the
signal that something has gone wrong.

## 6. Open decisions

- **Naming.** `warm` / `crisp` are placeholders; the UI labels are a copy decision.
- **Discoverability.** If an icon-only control tests poorly, add a labelled row on the library page.
  Do not build a settings sheet for two options.
- **Third axis?** Text measure and line-height are a separate, legitimate reading-preference axis and
  are deliberately *not* bundled here — bundling them would make the toggle a settings panel.

## 7. Files

- `mocks/problem-1-two-queens-one-king (10).html` — must be vendored into the repo (it exists only
  in `~/Downloads` today) so `crisp` has a versioned source of truth.
- `IITM-DESIGN-PLAN.md` §11 Phase 9 — the implementation plan and the copy-pasteable CSS.
- `site/src/styles/site.css` — token blocks and the four scoped deltas.
- `site/src/layouts/Base.astro` — head boot, `hic_style`, the `storage` sync.
- `site/src/components/AppBar.astro` — the control.
