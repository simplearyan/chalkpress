---
# ── Identity ────────────────────────────────────────────────────────────
# One folder per question; filename mirrors the slug: pq-001/index.md
id: calc-dd-001
subject: multivariable-calculus   # folder under content/subjects/
topic: directional-derivatives    # used for portal chips + search
title: Directional Derivatives & Tangent Plane Existence
slug: directional-derivatives-tangent-plane   # optional; defaults to id
difficulty: medium               # easy | medium | hard
source: GATE 2024                # exam / textbook / original

# ── Answer ──────────────────────────────────────────────────────────────
answer_type: options             # options | value | text
answer: "Options B and D"        # the final answer as shown on the page
options:                         # only when answer_type: options
  - id: A
    text: "$D_\\mathbf{u}f(0,0) = u_2^2/u_1$ for all unit $\\mathbf{u}$ with $u_1 \\neq 0$"
    correct: true
  - id: B
    text: "$f$ is differentiable at $(0,0)$"
    correct: false

# ── Pipeline (see IITM-FUTURE-PLAN.md §6) ───────────────────────────────
status: draft                    # draft | ai-draft | reviewed | scripted | animated | rendered | published
assignee: ""                     # who owns it right now
tags: []                         # free-form extras

# ── Given spec-card (problem page's sticky aside) ───────────────────────
# Rows render label → value; value may contain $...$ inline math.
given:                           # [] renders the page without the aside
  - label: Deck
    value: "Standard, 52 cards"
  - label: Draw
    value: "4 cards"
goal: "find $f_{XY}(2, 1)$"      # the goal-box expression; "" hides it

# ── Outputs (filled by later pipeline steps; leave empty at draft) ──────
video: ""                        # renders/<id>/final.mp4  (or storage URL)
thumb: ""                        # renders/<id>/thumb.png
youtube: ""                      # YouTube video id after publish
duration_ms: 0                   # final video length, set at render
# ────────────────────────────────────────────────────────────────────────

# The question itself. Markdown + LaTeX ($...$ inline, $$...$$ display).
# Kept in the body (not frontmatter) so the file reads naturally in editors.
---

Find the critical points of the function $f(x, y) = 3x^2y + y^3 - 3x^2 - 3y^2 + 2$.
