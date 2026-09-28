/* ESM adapter for hic-storyboard.js (classic UMD core).
 * Lets `import { compileStoryboard } from './hic-storyboard.esm.js'` work in
 * Node ("type":"module" repos) and bundlers, while the core file itself stays
 * a plain classic script for test-renderer / designs pages. */
import './hic-storyboard.js';

const api = globalThis.hicStoryboard;
if (!api) throw new Error('hic-storyboard.js failed to register globalThis.hicStoryboard');

export const { compileStoryboard, buildStandalonePage, RUNTIME_CSS } = api;
