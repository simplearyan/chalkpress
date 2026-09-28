<!-- Template for solution.md — the canonical worked derivation.
     Reused by the problem page (rendered as steps), by `iitm script`
     (source for narration), and by reviewers (correctness gate).
     One ## block per step. Do not skip steps the narration will need. -->

## 1. Compute Partial Derivatives

Set $f_x = 0$ and $f_y = 0$ simultaneously:

$$f_x = \frac{\partial}{\partial x}(3x^2y + y^3 - 3x^2 - 3y^2 + 2) = 6xy - 6x = 6x(y - 1)$$
$$f_y = \frac{\partial}{\partial y}(3x^2y + y^3 - 3x^2 - 3y^2 + 2) = 3x^2 + 3y^2 - 6y$$

## 2. Analyze Equation (1): $6x(y - 1) = 0$

This equation implies two cases: either $x = 0$ or $y = 1$.

## 3. Case 1: $x = 0$

Substitute $x = 0$ into $f_y = 0$:

$$3(0)^2 + 3y^2 - 6y = 0 \implies 3y(y - 2) = 0$$

This yields $y = 0$ and $y = 2$.

**Critical Points from Case 1:** $(0, 0)$ and $(0, 2)$.

<!-- Continue with ## 4, ## 5 ... one heading per step.
     Final step should restate the answer so the page's answer card
     and the script's closing line can quote it verbatim. -->
