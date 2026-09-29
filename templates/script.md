<!-- Template for script.md — narration beats, one ## block per beat.
     Written by `iitm script` from the reviewed solution, hand-edited after.
     Rules that keep the audio pipeline simple:
       • One ## block = one timing window, and one plan row in "Build the short".
       • Its paragraphs are the script bubbles: one bubble per paragraph, one
         spoken utterance each. Keep a bubble to a single breath, and quote it
         with “ ” — the sheet is the deliverable script, copied verbatim.
       • Beats are strictly ordered and non-overlapping in time.
       • `scene` must reference an existing storyboard.json scene id.
       • Keep spoken math verbal ("four choose two", not "$\binom42$"). -->

## 0–4s · scene: intro

“Ever get stuck on joint probability? Let's crack this card problem in 60 seconds.”

“We're drawing 4 cards from a deck of 52. We want exactly 2 Queens and 1 King.”

## 4–9s · scene: combos

“Step 1: grab the Queens. There are 4 in the deck, we need 2 — that's 4 choose 2, or 6 ways.”

“Step 2: get that King. 4 Kings in the deck, we want 1 — 4 choose 1 is 4 ways.”

“Step 3: the last card just needs to avoid Queens and Kings, leaving 44 safe cards — 44 choose 1 is 44.”

## 9–15s · scene: answer

“Multiply those together: 6 times 4 times 44 gives 1,056 winning hands.”

“Divide by the total ways to draw 4 cards — 270,725 — and we land on 0.0039.”

“Boom. Option A. Subscribe for more math hacks.”
