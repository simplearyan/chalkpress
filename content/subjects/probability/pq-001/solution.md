## 1. Total possible outcomes

The number of ways to draw *any* 4 cards from 52 is a straightforward combination:

$$\binom{52}{4} = \frac{52!}{4!(52-4)!} = 270{,}725$$

## 2. Favorable outcomes

- **The Queens** — 4 in the deck, we need 2: $\binom{4}{2} = 6$
- **The King** — 4 in the deck, we need 1: $\binom{4}{1} = 4$
- **The last card** — must be neither Queen nor King, leaving $52 - 4 - 4 = 44$ candidates: $\binom{44}{1} = 44$

## 3. Putting it together

Multiply the favorable combinations and divide by the total:

$$\text{Probability} = \frac{\binom{4}{2} \times \binom{4}{1} \times \binom{44}{1}}{\binom{52}{4}} = \frac{6 \times 4 \times 44}{270{,}725} = \frac{1{,}056}{270{,}725} \approx 0.0039$$

So $P(2\text{ Queens}, 1\text{ King}) \approx 0.0039$ — option A.
