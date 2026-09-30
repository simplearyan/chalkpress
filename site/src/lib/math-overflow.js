/* Wide display equations scroll inside their own surface (see
 * `.prose p:has(.katex-display)` in site.css). A scrollable region that cannot
 * be focused is unreachable by keyboard, so this labels only the ones that
 * actually overflow — the rest stay plain prose.
 *
 * Two pages typeset math and both need it: the question page (worked steps) and
 * the subject portal (question bodies). It lives here rather than in both
 * because the two had to be kept in step by hand, and only one of them was.
 *
 * Math ships as markup, not from a CDN, so there is nothing to wait for beyond
 * the webfonts — those change the metrics, which is why this re-measures after
 * load and once more when a late font swap has settled. */

export function markOverflowingMath() {
  const surfaces = [...document.querySelectorAll('.prose p')]
    .filter((el) => el.querySelector('.katex-display'));
  if (!surfaces.length) return;
  const mark = () => {
    for (const el of surfaces) {
      if (el.scrollWidth <= el.clientWidth + 1) continue;
      el.tabIndex = 0;
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', 'Equation — scrolls horizontally');
    }
  };
  requestAnimationFrame(mark);
  window.addEventListener('load', mark);
  setTimeout(mark, 600);
}
