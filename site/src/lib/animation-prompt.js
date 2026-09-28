/* AI prompt builder — mirrors test-renderer's aiBuildPrompt contract 1:1 so
 * a prompt copied from the IITM site and a prompt copied from test-renderer
 * produce interchangeable replies. The pasted reply parses in either tool:
 *   - fenced ```html / ```css / ```js blocks (test-renderer aiParseReply)
 *   - <title> → clip name, <!-- ds:16:9|9:16 --> → design space,
 *   - <!-- dur:ms --> → clip duration (parsed by test-renderer).
 */

export function buildAiPrompt(brief, durMs, ds) {
  const space = ds === '9:16' ? { w: 450, h: 800, label: 'portrait 9:16' } : { w: 800, h: 450, label: 'landscape 16:9' };
  return [
    'You are generating an HTML-in-Canvas animation for a video editor.',
    '',
    'WHAT I WANT:',
    brief,
    '',
    'HARD CONTRACT (violations break the video render):',
    '1. Deterministic time: ALL animation must be driven by a single global function onFrame(time) where time is milliseconds since the clip start (number). Same time in = same frame out, forever. The editor seeks to any time and re-renders.',
    '2. No requestAnimationFrame, no setTimeout/setInterval, no CSS @keyframes or animation: properties, no transitions. You compute every element state inside onFrame from time only.',
    '3. The design space is exactly ' + space.w + ' x ' + space.h + ' pixels (' + space.label + '). Use absolute sizes in px; the renderer scales the whole stage to any output resolution. Use width:100%;height:100% on your root container.',
    '   Right after the <title> tag, add the design-space marker comment: <!-- ds:' + ds + ' --> — it locks the render to this stage size.',
    '   Also add the duration marker right after it: <!-- dur:' + durMs + ' --> (milliseconds).',
    '4. Vanilla HTML/CSS/JS only — no bundlers, no imports, no fetch/XHR/network calls of your own. Allowed CDN exceptions (only when the design needs them): KaTeX for math and marked for markdown — load them with their <script src="https://cdn.jsdelivr.net/npm/..."> tags at the top of the html block (close each tag properly).',
    '5. Images must be CORS-safe https URLs (images.unsplash.com is fine) and animated via style properties (transform/opacity/filter/clip-path) inside onFrame.',
    '6. Guard element lookups (if(el){...}) so a missing id never throws.',
    '7. The FIRST line of the html block must be <title>Short Name</title> — 2-4 Title Case words naming the animation. It becomes the clip\'s display name and every export filename. No other head tags.',
    '',
    'CLIP DURATION: ' + durMs + ' ms. Choreograph the animation to complete within that time.',
    '',
    'OUTPUT FORMAT — respond with EXACTLY three fenced code blocks and nothing else:',
    '```html',
    '<title>Short Name</title><!-- ds:' + ds + ' --><!-- dur:' + durMs + ' --><!-- then the full markup for the ' + space.w + 'x' + space.h + ' stage -->',
    '```',
    '```css',
    '/* all styles; root container fills 100% x 100% */',
    '```',
    '```js',
    'function onFrame(time) { /* deterministic animation */ }',
    '```',
  ].join('\n');
}

/* The clipboard payload the site's Copy code button emits: the compiled clip
 * as three fenced blocks carrying the title/ds/dur markers. Pasting it into
 * test-renderer's AI tab (or the Code tab) applies code AND duration. */
export function clipToFenced({ title, ds, durMs, html, css, js }) {
  const header = '<title>' + title + '</title>\n<!-- ds:' + ds + ' -->\n<!-- dur:' + durMs + ' -->';
  return [
    '```html',
    header + '\n' + html,
    '```',
    '',
    '```css',
    css,
    '```',
    '',
    '```js',
    js,
    '```',
  ].join('\n');
}
