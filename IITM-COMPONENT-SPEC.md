# IITM-COMPONENT-SPEC.md — the problem page, component by component

The detail layer for `IITM-DESIGN-PLAN.md` (which holds the sequencing). One section per
piece of the reference mock, each with the mock's exact numbers, what the site renders
**today** (measured on the live build, not guessed), the required change, and a test that
proves it.

Reference: `mocks/problem-1-two-queens-one-king (16).html` — `#part-solve` (question
solving), `#part-produce` (animation + script), `#part-next` (up next).

Evidence note: "measured" values come from `getComputedStyle` / `getBoundingClientRect` on
the built site at 320px and 1440px, after the Phase 0–1 commits (`e9e6e8c`, `07046ac`).

---

## 1. Page skeleton

| | Mock | Site today | Action |
|---|---|---|---|
| Container | `1080px` + `clamp(16px,4vw,32px)` | done in Phase 0 | — |
| Hero | left-aligned, `chip` → `h1` → one-line description `max-width:44rem` | **centred**, no chip, `p` = the `source` citation | left-align; add the chip (`topic · difficulty`, `--tertiary-container`); add a real description line |
| Hero `h1` | `clamp(2.1rem,6vw,3.5rem)` Literata 600, `-0.015em` | `clamp(2.1rem,4.2vw,3.1rem)` centred | adopt the mock's ramp |
| Section head | overline (part accent) + `h2` + `::after` **52×3px** rule + sub `46rem` | `h2` with `border-bottom` on an `inline-block` (rule width tracks the text) | switch to the `::after` rule so both parts share one rule and it can take the gold accent in Part 2 |
| Section rhythm | `padding: clamp(40px,7vw,72px) 0 8px` | `.wrap-top`/`.zone-produce` fixed paddings | adopt |
| Part 2 band | **none** — same page tone as Part 1 | `.zone-produce` = `--container` band with top/bottom rules (measured `rgb(238,236,227)`) | delete the band; separate the parts by rhythm only |
| Prose measure | `65ch` | `58–62ch` | `var(--measure)` |
| Skip link | none | none | add "Skip to the solution" (see §13) |

---

## 2. LaTeX & math surfaces ← called out

**Mock.** KaTeX 0.16.11 (`katex.min.css` + `katex.min.js` + `auto-render.min.js`) with
`$…$` / `$$…$$` delimiters, `throwOnError:false`, and `pre`/`code` excluded. Display math
lives in a **dedicated surface**:

```
.math   { background: var(--container); border-radius: 14px; padding: 8px 16px;
          overflow-x: auto; max-width: 100% }
.math .katex-display { margin: .6em 0 }
.katex-display { overflow-x: auto; overflow-y: hidden; max-width: 100% }
```
Inside the solution card the surface steps to `--container` (the card itself is
transparent, per the borderless pass). Content style: `\binom`, `\frac`, `\text{…}`,
`{,}` comma groups, `\ldots` — nothing that forces display-style sizing inside text.

**Site today.** Same KaTeX version and the same auto-render call (Base.astro) ✓. But there
is **no `.math` surface**: `solution.md` is rendered straight into `.prose`, so display
equations sit on the card with no container, and the only overflow handling is
`.prose .katex-display { overflow-x: auto }` — which produces a *visible* scrollbar under
every wide equation.

**Measured at 320px: every display equation overflows.**

| Equation | scrollWidth | container width |
|---|---|---|
| `\binom{52}{4} = 52!/4!(52-4)! = 270{,}725` (step 1) | 256 | 233 |
| the probability fraction (step 3) | **544** | 233 |
| `P(2 Queens, 1 King) = 1{,}056/270{,}725` (step 4) | 344 | 233 |

**Action.**
1. Add the `.math` surface (mock values above) and render `$$…$$` blocks inside it — the
   content store already isolates them as their own paragraphs, so this is a
   `marked` renderer hook or a small post-process in `[id].astro`, not a content rewrite.
2. Keep `overflow-x: auto`, but make overflow *legible instead of ugly* (§13.1): hide the
   scrollbar until hover/focus, fade the overflowing edge, and make the region focusable.
3. Scale display math down on narrow screens before resorting to scroll:
   `.math .katex { font-size: clamp(.9rem, 3.6vw, 1.21em) }`.
4. **Quiz options**: they use `\dfrac` in the content (`index.md` options A–D), which forces
   display style and inflates the buttons — measured heights **94 / 73 / 73 / 70px** against
   the mock's `min-height: 56px`. Change the four option strings to `\frac`/`\binom` forms
   (or `\tfrac`) and pin `min-height: 56px`, so an option is one line and the row of four is
   half as tall.

**Test.** At 320px, no equation's scrollWidth exceeds its container by more than ~1.15×;
every `.math` sits on a `--container` rounded surface; option buttons are ≤64px tall.

---

## 3. Quiz ("Try it yourself")

| | Mock | Site today | Action |
|---|---|---|---|
| Card | `--container`, radius 20, **`border-left: 3px solid var(--accent)`** only | `.try-card` (surface + border) with the accent left edge ✓ | tonal fill |
| Label | overline in `--tertiary` | mono `--accent` ✓ | keep, wording = "Try it yourself" |
| Options grid | `repeat(2,minmax(0,1fr))`, gap 12, 1 column ≤719px | 2 → 1 at **560px** | adopt the 719px tier |
| Option | `min-height:56px`, `padding:12px 16px`, radius 14, **transparent** bg, `1px solid var(--outline)`, 28px `--container-hi` key circle (A/B/C/D) in mono, hover = primary 8% state layer + primary border | filled `--container` + border, **no key circle**, hover only recolours the border; measured 70–94px tall | add `.k` key circles from `o.id`; transparent + outline; state-layer hover; min-height 56 |
| Correct | `--success-container` + `--on-primary-container`, weight 500 | `rgba(63,157,114,.12)`-ish container roles (fixed in Phase 0) ✓ | keep |
| Incorrect | `--error-container` | ✓ | keep |
| After answering | all options disabled, correct one highlighted | options stay clickable (re-answer allowed) | decide: lock after answering (mock) — the walkthrough's "Show all" is the escape hatch |
| Feedback | filled bar (`--success-container` / `--error-container`), radius 12, `padding:12px 16px`, weight 500, `role="status" aria-live="polite"` | plain coloured text, **no live region** | adopt the bar + the live region |
| Prompt | question reworded as a warm-up ("how many ways to draw *any* 4 cards…") | generic "Pick the option that matches your answer" | consider a `prompt:` field (§14) |

---

## 4. Given card ← called out

| | Mock | Site today | Action |
|---|---|---|---|
| Card | tonal (`--container`), radius 20, sticky ≥900px at `300px` | sticky at `280px`, surface + border | 300px, tonal |
| Label | overline "Given" in `--primary` | mono `--primary` ✓ | keep |
| Rows | `display:flex; justify-content:space-between; gap:12px; padding:12px 0`, divider = `1px solid color-mix(in srgb, var(--outline-var) 55%, transparent)`, **last row borderless**; `dd` right-aligned, weight 500, may contain math | `grid-template-columns: 5.2rem 1fr` with **dashed** dividers (`dashed rgb(220,216,200)`) | space-between rows, solid 55% dividers, drop the last divider, right-align values |
| Goal box | flat `--primary-container`, radius 14, `padding:16px`; `small` = `.75rem`, `letter-spacing:.08em`, uppercase, 500, `opacity:.8`; value `1.15rem` in `--on-primary-container` | `color-mix(primary 11%)` + `1px` tinted border, radius 9 | flat container role, radius 14 |
| Sticky offset | `calc(88px + safe-area)` | done in Phase 1 ✓ | — |

Reality check from the screenshots: the mock's row labels sit at a lighter weight and the
values carry the emphasis; the site's mono uppercase labels currently compete with the
values for attention. Adopting the mock means `dt` = `--on-variant`, `dd` = `--on-surface`
weight 500 — a one-role change with a real readability gain on phone widths where the two
columns sit close together.

---

## 5. Solution steps + walkthrough ← "question solving design"

| | Mock | Site today | Action |
|---|---|---|---|
| Step count | **3** (`## 1..3`) | **4** — `solution.md` has `## 4. Answer`, and the answer card renders it *again* | drop the duplicate (content fix, §14) |
| Circle | 40px, **solid `--primary`**, `--on-primary` numeral 500 | 32px, **outlined** (`2px solid --primary`, surface fill) | solid 40px |
| Step grid | `40px minmax(0,1fr)`, gap 16, `padding-bottom:20px` | `2.4rem minmax(0,1fr)`, gap 1rem, flex column with 2rem gap | adopt |
| Connector | per-step `::before` (`left:19px; top:44px; bottom:4px; width:2px`, `--outline-var`), absent on the last step and on hidden steps | one global `.steps::before` line drawn behind everything | per-step connector |
| Body | `p`/`ul` `max-width:65ch`, `--on-variant`, `strong` = `--on-surface`, `ul` gap 8 | similar ✓ | align measure |
| Walkthrough | **all steps hidden; a control strip reveals them one at a time**, persists to `localStorage['walk-step']`, dots (8px, `--primary` + `scale(1.25)` when on), live count "Step N of 3" (`role=status`), "Show all", primary "Next step →" → "Show answer" → "Restart"; each reveal runs the `.reveal` keyframe; `scrollIntoView({block:'nearest'})` follows; `.linked` marks steps above the last visible one | **absent** — everything is always visible and the old stepper only highlighted a dot | add the walkthrough |
| Motion | `.reveal{animation:reveal .35s ease both}` (`translateY(12px)`→none) | none | add + honour `prefers-reduced-motion` |

This is the single most "product-like" piece of the mock: it turns a wall of derivation into
a paced walk. Two design notes for our port:

- Steps must be **honest**: with 3 real steps, "Step 2 of 3" means something.
- Persist per question, not globally (`walk-step:<subject>/<id>`), so step 3 of pq-001
  doesn't pre-open step 3 of pq-002 — the mock's global key is a latent bug.

---

## 6. Answer card

| | Mock | Site today | Action |
|---|---|---|---|
| Surface | flat `--primary-container`, radius **24**, `padding:20px 24px`, flex `space-between`, wraps | **gradient** (primary 13% → accent 9%) at radius 14 | flat container role, radius 24 |
| Label | `small` overline, `opacity:.8` | mono `.78rem` "FINAL ANSWER" | mock's overline, at 0.8 opacity |
| Value | `1.8rem` Literata 600 | `2.1rem` (2.1rem desktop, 1.5rem phone) | 1.8rem |
| Right side | primary pill badge `36px` "✓ Matches option A" | plain text "✓ Matches option A" | pill badge (`--primary` + `--on-primary`) |
| Position | last child of the walkthrough flow (`margin-top:8px`) | inside `.steps`, after a duplicated step 4 | after step 3, revealed by the walkthrough ✓ |

---

## 7. Animation preview (player) ← called out

**Mock:** a tonal card (radius 24, `padding:8px 8px 12px`, no shadow) whose bar is just
`Animation preview` (mono label) + a **36px aspect pill** (`--container-hi`, mono `9:16`/
`16:9`, `aria-pressed`). The only dark thing is the frame: `#0e1512`, radius 14,
`max-width:280px` at 9:16 / `min(100%,640px)` at 16:9, `container-type:inline-size` with
`@container player (min-width:420px)` bumping the in-frame type. Below: a 4px
`--container-hi` track with a 12px primary dot (hidden at rest), a row with **44px round
transparent play/restart** buttons (30px glyphs, state-layer hover) and a mono
`0:00 / 0:15`; a 64px blurred `stage-play` overlay on the frame itself; pointer drag + arrow
seeking on a `role="slider"` track; `data-state="idle|playing|paused|done"` drives which
glyph shows; `navigator.vibrate(12)` / `(8)`; a `K play/pause · R restart · ←/→ seek` hint
row under `@media(hover:hover) and (pointer:fine)` with `aria-keyshortcuts`, gated by an
IntersectionObserver and suppressed while typing.

**Site today (measured):** `.stage-shell` is a **dark `rgb(12,17,14)` card** (radius 16)
spanning the grid column, with **five buttons in its bar** (`btn-copy-code`, `btn-copy-
prompt`, `btn-open-tr`, `btn-play`, `btn-reset`), a native `<input type=range>` scrubber
with mono timecodes, no aspect toggle, no on-frame play overlay, no keyboard shortcuts, no
haptics. The engine underneath is `hic-frame`'s `HicRenderer` into a canvas — correct and
fine to keep (it is test-renderer parity).

**Action.**
1. Tone the shell: `--container`, radius 24, no shadow; keep only the label + aspect pill in
   the bar. Relocate the three tool buttons (see §13.4) so the bar stops competing with the
   content.
2. Wrap the canvas so the dark surface is the *frame*: `#animation-container` styling
   (radius 14, 9:16 max-width 280 / wide `min(100%,640px)`) with the canvas inside it.
3. Add the aspect toggle (persist the choice in `sessionStorage`), the on-frame play
   overlay, the progressive track + dot, 44px round controls, mono `0:00 / 0:15`.
4. **Keep the native range input** for scrubbing (keyboard + screen-reader support the
   mock's custom track lacks) but restyle it to the mock's look.
5. Add `K`/`R`/arrow shortcuts, `aria-keyshortcuts`, the hint row and the haptics.
6. Default aspect follows `storyboard.json`'s `aspect` (`9:16` for pq-001 — verified) rather
   than a hardcoded ratio.

**Test.** Play/pause/restart/replay/seek all work by mouse **and** keyboard; toggling the
aspect does not reflow the text column; the frame is the only dark surface on the page; the
stage is ≥40% of the viewport width on a phone in 9:16.

---

## 8. Script section ← called out

| | Mock | Site today | Action |
|---|---|---|---|
| Head | `h3` "Short-form script" + **outlined "Copy script" button** (36px, `--outline`, `--primary` text) | `h3` + a YouTube icon; **no copy button** | add the copy button; decide whether the icon stays (it is a nice cue; keep at 18px, `--error`) |
| Beats | **chat bubbles**: `padding:12px 16px`, radius 14 with `border-top-left-radius:4px` (a tail), `--container` fill, grid gap 10, sans | one block: Literata **italic**, accent left border, no radius (measured: transparent bg, `border-left:0` after the old `.script-sheet` wrapper) | bubbles |
| Beat count | 8 short beats, one sentence each | 3 beats (`script.md` `## 0–4s` etc.) rendered as prose | keep our content; bubble it. Optionally split the long beats for a better read |
| Visual plan | `plan-title` (500, `.95rem`, margin `24px 0 8px`), `li` grid **`72px 1fr`**, gap 8, `.925rem` `--on-variant`, `time` = **`--tertiary-container` chip** radius 8, mono `.78rem` | `time` = accent mono on transparent, grid `54/172` (measured), no chip | chips + 72px column |

Note: our beats carry both narration and scene notes (`## 0–4s · scene: intro`). The mock
separates *script* (bubbles) from *visual plan* (timed list) — we should do the same split,
i.e. render the beat prose into the bubble and the `scene:` marker into the plan row, rather
than printing the same content twice as the current page does.

---

## 9. Code drawer

| | Mock | Site today | Action |
|---|---|---|---|
| Summary | `min-height:64px`, `padding:16px 24px`, hover = 5% state layer, chevron 24px rotating **180°**, hint hidden ≤719px | summary height measured **26px**, chevron rotates 90°, hint always visible | adopt |
| Body | `padding:0 24px 24px`, grid gap 16, one note line + a **tonal "Copy all"** | note line only | add Copy all |
| Per language | `.lang` = `1px solid var(--outline-var)`, radius 14, head strip in `--container-hi` with a mono `.pill` and an **outlined Copy** button; `pre` = `--surface`, `--on-surface`, `.8rem/1.6` mono, `max-height:320px`, `tab-size:2` | `.code-lang-head` with a pill and **no buttons at all** (measured `copyBtns: 0`); `pre` always dark `rgb(12,17,14)` with `rgb(216,226,220)` ink | add per-language copy buttons; make `pre` theme-aware |
| Copy feedback | label swap (`.lbl-default` ↔ `.lbl-copied`) **+ snackbar** | none in the drawer | adopt both |

The missing per-language copy buttons are the most concrete "missed bit" on the page: the
mock offers copy-all plus three copies, we offer none inside the drawer (only the player's
"Copy code").

---

## 10. Up next card ← called out

| | Mock | Site today | Action |
|---|---|---|---|
| Surface | `--container`, radius 20, `padding:12px`, **no border, no resting shadow**; hover adds `--e2` | surface + `1px` border + `--e1` shadow at rest | borderless tonal + hover elevation |
| Overline | mono `.75rem`, `letter-spacing:.1em`, **accent**, *above* the title | centred `--on-variant` mono label above the card | accent, and move it inside the card as the mock does |
| Thumb | **96×96 square**, radius 14, `#0e1512`, mono `.7rem` `#93a29a` eyebrow over a `#e7ba55` `1.15rem` value; 80×80 ≤719px | 72×128 **9:16 poster** (measured) radius 10 | square 96×96 → 80×80 on phones |
| Text | `t` overline → `n` `1.2rem` Literata 500 → `s` `.9rem` `--on-variant` | title + `source` ✓ | align sizes |
| Affordance | whole card is the link (no arrow) | card is the link **+ an arrow button** | keep the arrow (see §13.5) |
| Layout | `padding:40px 0 64px`, single column, `← Back to Shorts library` text button under it | centred max-width 30rem card | left-align the whole block to match the mock's rhythm |
| Anchor | `#part-next` | added in Phase 1 ✓ | — |

---

## 11. Snackbar + resume

Mock has one shared snackbar (`--on-surface` ground, `--bg` ink, radius 8, `--e2`,
`max-width:calc(100vw - 32px)`, optional action in `--primary-container`) used for "Copied to
clipboard" and for **"Picked up where you left off → Start over"** (skip when a hash is
present or `y < 500`, 7-day TTL, restores instantly, and the action also resets the
walkthrough). We have neither; our own `.settle-pin` already covers the flicker the resume
flow exists to hide, so the snackbar is a **confirmation + escape hatch**, not a fix. Add it,
and wire "Start over" to the walkthrough reset. Per-question resume key.

---

## 12. Missed-bits inventory

Everything above that the mock has and we do not, in the order it shows up on the page:

1. Hero chip + left-aligned hero + description line (§1)
2. `h2` accent rule as a `::after` of fixed width (§1)
3. Part-2 band removal (§1)
4. `.math` surfaces + display-math sizing + overflow affordance (§2)
5. Quiz key circles, transparent option surface, 719px single-column tier (§3)
6. Quiz feedback **bar** + live region; lock-after-answer decision (§3)
7. Given-card row mechanics (space-between, 55% solid divider, no last divider), flat goal box (§4)
8. Solid 40px step circles + per-step connectors (§5)
9. **The walkthrough** (reveal, dots, count, Show all, persistence) (§5)
10. Flat answer card at radius 24 + badge pill (§6)
11. Toned player shell, aspect pill, on-frame play overlay, progressive track, 44px controls, mono timecode (§7)
12. `K`/`R`/arrow shortcuts, `aria-keyshortcuts`, hint row, haptics (§7)
13. Script bubbles + "Copy script" (§8)
14. Plan-time chips + 72px column (§8)
15. Code drawer: 64px summary, 180° chevron, hidden hint on phones, **Copy all + per-language copy**, theme-aware `pre` (§9)
16. Up-next: square thumb, tonal borderless card, hover `--e2`, accent overline (§10)
17. Snackbar + resume/Start-over (§11)

---

## 13. Where we should beat the mock

Small, concrete improvements that cost little and are justified by what the build actually
measures — each one is a deviation from the mock, so it is called out explicitly.

**13.1 Make overflowing math usable, not just scrollable.** Measured: at 320px, equations
overflow by up to 2.3× (544 vs 233). The mock hides this behind `overflow-x:auto` with a
scrollbar the user must notice. Do better: shrink display math (`clamp`), fade the cut edge,
hide the bar until hover/focus, and give the region `tabindex="0"` + `role="region"` +
`aria-label="Equation, scrolls horizontally"` so keyboard and screen-reader users can reach
the overflow. A scrollable region that cannot be focused is a WCAG 2.1.1 failure.

**13.2 Kill the duplicated answer.** `solution.md` ends with `## 4. Answer` and the page then
renders a FINAL ANSWER card — the same value twice, and it inflates the step count so the
walkthrough's "Step N of 3" would be a lie. Render steps 1–3 and let the answer card own the
answer.

**13.3 Keep the native scrubber.** The mock's custom `role="slider"` track is pointer-first.
Our `<input type="range">` gives arrow-key seeking, touch, and a correct a11y tree for free;
style it to the mock's look instead of replacing the element.

**13.4 Give the player's tool buttons a real home.** Five controls in one bar (measured)
crowds the mock's two-item bar and buries Play. Keep `Copy code` / `AI prompt` / `Renderer`
but move them out of the device bar: icon+label tonal buttons in a row under the frame
(≥720px) that collapse to icon-only buttons with `aria-label` + `title` on phones, or into
the code drawer's header. Play/restart/timecode stay in the bar row, as the mock has them.

**13.5 Keep the up-next arrow.** The mock makes the whole card the link with no affordance.
Our circular arrow is a better click indicator on desktop and costs nothing; keep it at 34px
and let it fill on hover (already built).

**13.6 Active state for assistive tech.** The mock marks the active tab/bottom-nav item with
a class only. Add `aria-current="true"` to the active tab/nav item, and a focusable
skip-link ("Skip to the solution") since the bar is now sticky on every page.

**13.7 Persist per question, not globally.** `walk-step`, resume position and the aspect
toggle should all be keyed by `subject/id` (or cleared on navigation), unlike the mock's
single global key.

**13.8 Respect reduced motion for the reveal.** The mock's `.reveal` keyframe runs
regardless; gate it (and the smooth scroll) behind `prefers-reduced-motion`.

---

## 14. Content-model changes this requires

| Change | Where | Why |
|---|---|---|
| Drop `## 4. Answer` (or stop rendering a step titled "Answer") | `content/subjects/probability/pq-001/solution.md` (+ pq-002 if it matches) | removes the duplicate and makes the walkthrough honest |
| Options use `\frac` / `\binom`, not `\dfrac` | `index.md` frontmatter `options[].text` | option buttons drop from 70–94px to ~56px |
| Beat prose vs `scene:` marker split | `script.md` (`## 0–4s · scene: intro`) already carries both; the page just needs to render them into the bubble and the plan row separately | the mock has two distinct components |
| Hero description | new optional `summary:` frontmatter field | the mock's hero carries a real one-liner; we currently reuse `source` (a citation) |
| Quiz prompt | optional `prompt:` field, defaulting to today's wording | mock's warm-up phrasing is content, not layout |
| `og:image` 404 | `pq-001/index.md` → `meta-src/pq-001-og.png` does not exist | broken social card noticed while touching frontmatter |

Schema additions go in `site/src/content/config.ts` and `templates/index.md`, and
`tools/validate.mjs` should accept them (optional → no validation change needed).

---

## 15. Implementation order and acceptance tests

**Step 2a — skeleton (hero, section heads, band, prose measure).**
Left-aligned hero + chip; `::after` rules; delete `.zone-produce`; `--measure` everywhere.
*Accept:* matches the mock's Part 1/Part 2 openings side by side at 1440; no band colour
anywhere; the two `h2` rules are exactly 52×3px and take primary/gold respectively.

**Step 2b — solve surface (given card, steps, math surface, answer card).**
*Accept:* step circles are 40px solid; the connector appears between steps only; every
display equation sits on a rounded `--container` surface; nothing overflows the viewport at
320; the answer appears once.

**Step 2c — quiz.**
Key circles, 719px tier, feedback bars with a live region, lock-after-answer.
*Accept:* keyboard-only: Tab to an option, Enter, feedback announced, focus-visible ring on
every control; option row height ≤64px at 1440.

**Step 2d — walkthrough.**
Reveal/Show all/Next step/Show answer/Restart, dots, count, per-question persistence, reveal
animation.
*Accept:* full pass with the keyboard only; reload mid-way restores the same step for that
question; a second question starts at step 1; reduced-motion removes the animation.

**Step 3a — produce layout + device chrome.**
Band gone (2a), grid `minmax(320px,400px) minmax(0,1fr)` at 900px, tonal device card, aspect
pill, frame-only dark surface, progressive track, 44px controls, mono timecode.
*Accept:* toggling the aspect does not move the script column; the frame is the only dark
box; the play button is ≥44px on phones.

**Step 3b — player interaction.**
Pointer + keyboard seek, `K`/`R`, hint row, haptics, play overlay, `aria-keyshortcuts`.
*Accept:* all controls reachable by Tab; shortcuts fire only while the player is on screen
and never while typing; the hint row is absent on touch.

**Step 3c — script, plan, code drawer.**
Bubbles, Copy script, time chips, 64px summary, 180° chevron, Copy all + per-language copy
with label swap and snackbar, theme-aware `pre`.
*Accept:* copying each of the four things puts the exact text on the clipboard and shows the
snackbar; in light theme the code block is light with `--on-surface` ink.

**Step 4 — up next + resume snackbar.**
*Accept:* `#part-next` matches the mock (square 96 thumb, tonal card, hover `--e2`); the
snackbar appears only for restores past 500px, and "Start over" resets the walkthrough.

**Step 5 — library + portal** on the same system (chip/shelf card state layers, M3 search
bar), then **step 6** a11y/motion polish and **step 7** the verification matrix in
`IITM-DESIGN-PLAN.md` §9.

---

## 16. Decisions I need from you

1. **Lock the quiz after answering** (mock) or keep re-answering allowed (today)?
2. **Code blocks follow the theme** (mock: light code in light mode) or stay dark always
   (today)?
3. **Player tool buttons**: row under the frame, icon-only on phones, or move them into the
   code drawer?
4. **Up-next arrow**: keep our arrow affordance or drop it for the mock's plain card?

Everything else in this document is unambiguous and can be built as written.
