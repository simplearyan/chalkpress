/* Math is rendered at BUILD time, not in the browser.
 *
 * The site used to pull KaTeX + auto-render from a CDN (deferred) and typeset
 * the page from a polling loop, so raw `$...$` was painted first and swapped for
 * the real markup a few hundred milliseconds later — that swap is the refresh
 * flicker. Rendering here means the HTML ships already typeset: no CDN round
 * trip, no polling, and the page's final layout is known before the first paint,
 * which also keeps the scroll position and the section highlight steady.
 *
 * Two entry points, because math reaches the page two ways:
 *   tex()        — HTML that marked already produced (solution.md bodies)
 *   texEscaped() — plain authored strings from frontmatter (option text, givens,
 *                  the goal), which Astro would otherwise escape for us
 */
import katex from 'katex';

/* One pass. The alternation tries `$$…$$` (display) before `$…$` (inline), and
   String.replace/matchAll scan the ORIGINAL string, so the markup KaTeX
   generates is never re-scanned for further math. */
const MATH = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

/* htmlAndMathml (KaTeX's own default) is deliberate: the MathML annotation is
   what screen readers read, and it is the same output the client-side
   auto-render produced, so this changes when the math is built, not what. */
const render = (source, display) =>
  katex.renderToString(String(source).trim(), {
    displayMode: display,
    throwOnError: false,
    strict: false,
  });

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/* Math inside <code>/<pre> is code, not math — those regions are left alone. */
const CODE = /<(?:code|pre)\b[\s\S]*?<\/(?:code|pre)>/g;

function substitute(text, escape) {
  const s = String(text ?? '');
  let out = '';
  let last = 0;
  for (const m of s.matchAll(MATH)) {
    out += escape ? esc(s.slice(last, m.index)) : s.slice(last, m.index);
    out += render(m[1] ?? m[2], m[1] !== undefined);
    last = m.index + m[0].length;
  }
  const tail = s.slice(last);
  return out + (escape ? esc(tail) : tail);
}

/** Math in marked output. Code blocks are skipped. */
export function tex(html) {
  const s = String(html ?? '');
  if (!s.includes('$')) return s;
  /* split() alternates prose, code, prose, code… so odd parts are code */
  return s.split(CODE).map((part, i) => (i % 2 ? part : substitute(part, false))).join('');
}

/** Math in a plain authored string, with the text around it escaped. */
export function texEscaped(text) {
  const s = String(text ?? '');
  return s.includes('$') ? substitute(s, true) : esc(s);
}
