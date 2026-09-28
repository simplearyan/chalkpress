---
id: pq-002
subject: probability
topic: vector-operations
title: Check the Set
difficulty: easy
source: Original (vector arithmetic on two coordinate points)

answer_type: options
answer: "All four claims hold"
options:
  - id: A
    text: "$2A = (2, 4)$ and $3B = (6, 9)$"
    correct: false
  - id: B
    text: "$A + B = (3, 5)$ and $A - B = (-1, -1)$"
    correct: false
  - id: C
    text: "All four claims hold — $2A = (2,4)$, $3B = (6,9)$, $A+B = (3,5)$, $A-B = (-1,-1)$"
    correct: true
  - id: D
    text: "$A - B = (-1, -1)$ only"
    correct: false

status: animated          # solved + scripted + animated in the pq-002 migration
assignee: ""
tags: [vectors, coordinate-geometry]

given:
  - label: Point A
    value: "$A = (1, 2)$"
  - label: Point B
    value: "$B = (2, 3)$"
  - label: Treat as
    value: "Vectors from origin"
goal: "check 4 claims"
prompt: "Recreate the vector-check short for points A=(1,2) and B=(2,3): a gold monospace title 'CHECK THE SET' with two white point chips A(1,2) and B(2,3) sliding up on a dark stage, the subtitle '2A · 3B · A+B · A−B' fading in; then four KaTeX computation lines (2A=2(1,2)=(2,4), 3B=3(2,3)=(6,9), A+B=(1+2,2+3)=(3,5), A−B=(1−2,2−3)=(−1,−1)) sliding in from the left one by one; finally the four result vectors, four green checkmarks, and a big Literata '4 / 4 CORRECT' that pops with a green highlight box stamping around it. Deterministic from time only."

video: ""
thumb: ""
youtube: ""
duration_ms: 17500
---

Two points are given: $A = (1, 2)$ and $B = (2, 3)$, both treated as vectors from the
origin. Verify the four claims

$$2A = (2, 4), \qquad 3B = (6, 9), \qquad A + B = (3, 5), \qquad A - B = (-1, -1).$$

Which option is correct?
