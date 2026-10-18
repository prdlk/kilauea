import { render } from 'pele'

/**
 * The hero headline, and the static stand-in that holds its place until the
 * app bundle has downloaded and the live one mounts.
 *
 * The live headline is a canvas rendered synchronously by pele the moment React
 * mounts, so the only gap is the time before the bundle executes. The stand-in
 * closes it: `heroBootHtml()` is inlined into index.html by vite.config.ts at
 * build time, rendered by the same pele the canvas uses, so it is painted before
 * any JavaScript runs and is still the only headline a visitor without
 * JavaScript sees. On mount React replaces it.
 *
 * At build time pele measures labels with its built-in width table; in the
 * browser it uses canvas metrics, so the live diagram can differ by a few px.
 */

/** The three labels the diagram is built from. */
const NODE_A = 'WYSIWYG editor'
const NODE_B = 'native mermaid'
const EDGE_LABEL = 'renders'

/**
 * Every string both renderers show. They live here rather than in the JSX
 * because the served document paints its own copy of this block: a string kept
 * in only one of the two is stale for the first second of a cold load, in the
 * copy that is hardest to notice.
 */
/** The sr-only h1, which is the diagram read as a sentence — composed rather
 *  than restated so the accessible headline cannot drift from the visible one. */
export const HERO_HEADLINE = `${NODE_A} ${EDGE_LABEL} ${NODE_B}`
export const HERO_SUBHEAD = 'Click a node to edit it. Perfect for polishing AI-generated diagrams.'
export const HERO_LICENSE = 'MIT'
export const HERO_HINT_LEAD = 'That headline is a live Mermaid diagram.'
export const HERO_HINT_BODY = 'Double-click a word to rewrite it.'

/**
 * The headline, as Mermaid. The verb rides the connector, which is where Mermaid
 * puts verbs, so the whole thing reads as one sentence.
 */
export const HERO_SOURCE_LR = `flowchart LR
  A[${NODE_A}] -->|${EDGE_LABEL}| B[${NODE_B}]`

export const HERO_SOURCE_TD = `flowchart TD
  A[${NODE_A}] -->|${EDGE_LABEL}| B[${NODE_B}]`

/**
 * Inclusive at 760 to match `@media (max-width: 760px)` in site.css, which sizes
 * the band for this layout. A strict `<` disagrees with the media query at
 * exactly 760px: the band goes tall for a stacked diagram while the source is
 * still left-to-right.
 */
export const HERO_STACK_MAX_WIDTH = 760

/**
 * Everything below builds raw HTML strings, where React's escaping does not
 * apply. The JSX consumers of these same constants get escaped for free, so
 * without this the first hero string to contain a `<`, `&` or quote would render
 * correctly in the app and malformed in the served document — the copy nobody
 * looks at during normal development. Static entities written directly into the
 * templates (`&middot;`, `&amp;`) are markup, not values, and stay as authored.
 */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const PLACEHOLDER_FONT = '"Inter", sans-serif'

/** pele's SVG for a hero source. `idPrefix` keeps ids unique when both
 *  orientations share one document. */
function heroPlaceholderSvg(source: string, idPrefix: string): string {
  return render(source, { fontFamily: PLACEHOLDER_FONT, idPrefix }).svg
}

/**
 * Both orientations ship in the served document because the build cannot know
 * the window width; site.css shows one and hides the other at the same
 * breakpoint `HERO_STACK_MAX_WIDTH` encodes.
 */
function heroPlaceholderBothHtml(): string {
  return (
    `<div class="hero-placeholder hero-placeholder-lr">${heroPlaceholderSvg(HERO_SOURCE_LR, 'hero-ph-lr')}</div>` +
    `<div class="hero-placeholder hero-placeholder-td">${heroPlaceholderSvg(HERO_SOURCE_TD, 'hero-ph-td')}</div>`
  )
}

/**
 * First-paint content for `#root`, replaced by the app on mount.
 *
 * It reproduces the hero's vertical rhythm exactly — a spacer the height of the
 * sticky header, then the section's own padding, badge, band, hint and
 * subheading at their real margins — so that mount swaps the markup without
 * moving anything the visitor is already looking at. The band carries the pele-rendered
 * stand-in, which the live canvas replaces on mount.
 *
 * The chrome the app owns and this does not (nav, buttons, the sections below)
 * arrives around the hero rather than displacing it.
 *
 * index.html is the single entry for every route, so this landing hero would
 * also paint over /playground and /hero-loop until the bundle routes away from
 * it. The trailing script drops it on those routes, matching main.tsx's own
 * pathname normalization. It is inline and synchronous so it runs during parse,
 * before first paint — it prevents a flash rather than causing one, and the only
 * thing it costs a JavaScript-less visitor is a landing hero on a route that
 * cannot function without JavaScript anyway.
 */
export function heroBootHtml(): string {
  return `<div class="boot">
  <div class="boot-header"></div>
  <div class="hero-section">
    <div class="hero-badge">
      <span class="hero-badge-dot"></span>
      Open source &middot; ${esc(HERO_LICENSE)} &middot; React &amp; vanilla
    </div>
    <h1 class="sr-only">${esc(HERO_HEADLINE)}</h1>
    <div class="hero-masthead" aria-hidden="true">
      <div class="hero-placeholder-layer">${heroPlaceholderBothHtml()}</div>
    </div>
    <div class="hero-hint">
      <span class="hero-hint-lead">${esc(HERO_HINT_LEAD)}</span>
      <span>${esc(HERO_HINT_BODY)}</span>
    </div>
    <p class="hero-sub">${esc(HERO_SUBHEAD)}</p>
  </div>
</div>
<script>if(location.pathname.replace(/\\/+$/,'')!==''){var b=document.querySelector('.boot');if(b)b.remove()}</script>`
}
