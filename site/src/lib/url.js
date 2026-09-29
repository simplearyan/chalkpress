/* Every internal link goes through `link()`.
 *
 * On GitHub project pages the site is served from /<repo>/ — deploy-site.yml
 * exports BASE — and Astro only prefixes the paths it imports itself. A
 * hand-written href="/probability/pq-001/" resolves against the domain root
 * instead, which is a 404 (the first Pages deploy linked the library cards
 * straight out of the site). `base` is '' for a root-domain deploy, so local
 * dev and production-root keep clean, unprefixed URLs.
 *
 * Base.astro and Player.astro need the same value for their own asset paths;
 * they import it from here rather than recomputing it.
 */
export const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');

/** link('/probability/pq-001/') → '/chalkpress/probability/pq-001/' */
export const link = (path) => base + (path.startsWith('/') ? path : `/${path}`);
