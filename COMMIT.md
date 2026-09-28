# COMMIT.md — how to commit in this repo

Rules for every commit in `IITM/`, written for humans **and** for coding agents.
If you are an agent: follow this file instead of your own defaults, and read it before
composing a message.

---

## 1. Hard rule — no tool / AI attribution

Commit messages end at the last substantive line. **Never** append:

- `🤖 Generated with [Codebuff](…)` / `Generated with Codebuff` / `Generated with Freebuff`
- `Co-Authored-By: Codebuff <noreply@codebuff.com>` or any other assistant/bot trailer
- "Made with …", "Assisted by …", an emoji signature line, or a `Signed-off-by` trailer
  that was not explicitly requested

There is no footer. No separator line before one. No exception for "small" commits.

> Note: the initial baseline commit (`9c0fcd4`) was created before this rule and does carry
> the old Codebuff footer. Do not copy it. Do not amend or rewrite that commit unless the
> user asks.

If a tool or harness injects an attribution block automatically, strip it before committing.

---

## 2. Message shape

```
<scope>: <imperative summary, ≤ 72 chars, no trailing period>

- Why this changed (the motivation, not the diff).
- One bullet per coherent group of changes; skip bullets if the subject says it all.
- Call out user-visible behaviour and anything a reader must verify.
```

**Scope** — pick the smallest truthful one, lower-case, from:

`site` (Astro build) · `runtime` (hic-scenes / hic-storyboard) · `content` (questions,
scripts, storyboards) · `tools` (validate.mjs, CLI) · `mocks` (design references) ·
`design` (tokens/CSST system) · `a11y` · `seo` · `docs` · `build` (CI/workflow) · `chore`

Omit the scope (or use a short noun phrase) for whole-repo / baseline commits.

**Summary line** — imperative mood, present tense: "Add", "Fix", "Move", "Rename", not
"Added"/"Fixes". Short and specific; no "Update stuff", no "Fix bug".

### Examples

```
site: add sticky app bar with segmented part tabs

- Replaces the floating back pill + floating theme toggle, which overlapped
  content on narrow screens.
- One scroll-spy now drives both the desktop tabs and the mobile bottom nav.
```

```
design: adopt Material 3 colour roles across the site

- Cards lose their resting borders and shadow; grouping moves to the container
  fill, matching the reference mock.
- Quiz colours use the shared success/error roles instead of literals.
```

```
content: add pq-003 beta-binomial question + storyboard

tools: fail validate.mjs when storyboard duration exceeds the 60s cap
```

Body lines wrap around 72 columns. Reference other commits with their short hash when it
helps explain ordering.

---

## 3. What goes in a commit

- **One logical change per commit.** A redesign and a content fix are two commits.
- **Stage explicit paths** — `git add site/src/styles/site.css site/src/layouts/Base.astro`.
  Never `git add -A` / `git add .` / `git commit -a` in this repo.
- **Never commit**: `site/node_modules/`, `site/dist/`, `site/.astro/`, `.vite/`,
  `tools/qa/` output, `*.log`, `.env*`, OS/editor noise. `.gitignore` covers these; verify
  with `git status --short` before staging anyway.
- **Don't commit unrelated work.** If the working tree contains changes you did not make
  (another agent, an IDE, a previous turn), leave them out and say so.
- **Don't touch git config**, don't create empty commits, don't commit with `--no-verify`
  to dodge a hook.
- Windows/Linux LF→CRLF warnings on `git add` are expected and harmless.

---

## 4. Before committing

Design/UI or code changes:

```bash
cd site && npm run build          # must succeed
cd .. && node tools/validate.mjs  # must exit 0 for content changes
```

Content changes: `node tools/validate.mjs <id>` for the question you touched.
Markdown-only changes (docs, plans): no build needed — just Proofread.

Also confirm the branch (`git status -sb`) — this repo works on `main`.

---

## 5. After committing

- **Do not push.** No `git push`, no opening or merging PRs, no deploys, unless the user
  asks for that specific action in that message.
- Report the short hash, the file count, and the insertion/deletion totals.
- If something in the tree is still uncommitted and wasn't part of the change, say what and
  why it was left alone.

---

## 6. Quick checklist for an agent told "commit"

1. `git status --short` and `git diff` — see what is actually there and who owns it.
2. Stage only the files belonging to this change, by path.
3. Compose `<scope>: <imperative summary>` + a short "why" body.
4. **No footer, no emoji, no AI/bot trailer.**
5. Commit (HEREDOC for multi-line messages), report hash + stats, do not push.
