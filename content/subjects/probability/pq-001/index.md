---
id: pq-001
subject: probability
topic: joint-probability
title: Two Queens, One King
difficulty: medium
source: Original (joint probability of a 4-card draw)

answer_type: options
answer: "≈ 0.0039  (1,056 / 270,725)"
options:
  - id: A
    text: "$\\dfrac{\\binom{4}{2}\\binom{4}{1}\\binom{44}{1}}{\\binom{52}{4}} = \\dfrac{1056}{270725} \\approx 0.0039$"
    correct: true
  - id: B
    text: "$\\dfrac{\\binom{8}{3}}{\\binom{52}{4}} \\approx 0.0017$"
    correct: false
  - id: C
    text: "$\\dfrac{\\binom{4}{2} + \\binom{4}{1} + \\binom{44}{1}}{\\binom{52}{4}}$"
    correct: false
  - id: D
    text: "$\\left(\\dfrac{2}{13}\\right)^2 \\cdot \\dfrac{1}{13}$"
    correct: false

status: animated          # solved + scripted + animated in the v1 migration
assignee: ""
tags: [cards, combinatorics]

given:
  - label: Deck
    value: "Standard, 52 cards"
  - label: Draw
    value: "4 cards"
  - label: Queens
    value: "$X = 2$"
  - label: Kings
    value: "$Y = 1$"
goal: "find $f_{XY}(2, 1)$"
prompt: "Recreate the card-draw probability short: a gold monospace title 'DRAW 4 CARDS' with four playing cards (Q♥ red, Q♠ black, K♦ red, and a muted grey '?') sliding up on a dark stage, subtitle '2 Queens · 1 King · 1 Other'; then three KaTeX combination rows (QUEENS \binom{4}{2}=6, KINGS \binom{4}{1}=4, OTHERS \binom{44}{1}=44) with gold monospace labels sliding in from the left one by one; finally the fraction \binom{4}{2}\binom{4}{1}\binom{44}{1}/\binom{52}{4} resolving to 1056/270725 ≈ 0.0039, with a big mint Literata '≈ 0.0039' popping and a green highlight box stamping around it. Deterministic from time only."

video: ""
thumb: ""
youtube: ""
duration_ms: 15000
---

A card is drawn 4 times from a standard 52-card deck **without replacement**. What is the
probability of drawing **exactly 2 Queens and 1 King** (and one other card)?
