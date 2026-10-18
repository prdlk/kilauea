import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { PeleCanvas, usePeleEditor } from '@kilauea/react'
import { track } from './analytics'
import {
  HERO_HEADLINE,
  HERO_HINT_BODY,
  HERO_HINT_LEAD,
  HERO_LICENSE,
  HERO_SOURCE_LR,
  HERO_SOURCE_TD,
  HERO_STACK_MAX_WIDTH,
  HERO_SUBHEAD,
} from './hero-diagram'
import {
  ACCENT,
  CodeMirrorPane,
  Logo,
  PRESETS,
  SkinToggle,
  TYPE_LABELS,
  canvasStyle,
  playgroundUrl,
  useCanvasControlTracking,
  type Skin,
} from './playground-shared'
import {
  ArrowUpRightIcon,
  BlocksIcon,
  CheckIcon,
  CopyIcon,
  DiffIcon,
  GithubIcon,
  MaximizeIcon,
  PointerIcon,
  ResetIcon,
  SyncIcon,
} from './icons'

const REPO = 'prdlk/kilauea'
const REPO_URL = `https://github.com/${REPO}`
const INSTALL_CMD = 'npm i @kilauea/react'

/**
 * Direction is picked once at mount rather than on every resize: a phone fits the
 * left-to-right layout by width, which shrinks the headline to caption size, but
 * re-picking on resize would overwrite whatever the visitor had typed into it.
 */
function initialHeroSource(): string {
  if (typeof window === 'undefined') return HERO_SOURCE_LR
  return window.innerWidth <= HERO_STACK_MAX_WIDTH ? HERO_SOURCE_TD : HERO_SOURCE_LR
}

const FEATURES: Array<{ icon: ComponentType; title: string; body: string }> = [
  {
    icon: SyncIcon,
    title: 'Two-way sync',
    body: 'Type Pele or edit visually. Both stay in lockstep.',
  },
  {
    icon: PointerIcon,
    title: 'Click to edit',
    body: 'Select any node to rename, reshape, or restyle it.',
  },
  {
    icon: DiffIcon,
    title: 'Minimal diffs',
    body: 'Every gesture becomes the smallest possible text edit.',
  },
  {
    icon: BlocksIcon,
    title: 'Framework-agnostic',
    body: 'Bindings for React, DOM, CodeMirror, and Monaco.',
  },
]

const stroke = { stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' } as const

/**
 * Hand-drawn nudges inside the inline playground, in the same Caveat voice as
 * the navbar's "Leave a star!" hint. Each one lives in its own pane and
 * points at that pane's content rather than at the chrome above it:
 *
 * - source sits in the code pane's flow directly under the last line of code, so
 *   its arrow reaches up into the source no matter how tall the preset is;
 * - preview pins to the canvas floor, clear of the zoom controls.
 *
 * Each arrow is drawn with its tip on the viewBox's horizontal centre (x=18 of
 * 36) and the tail curving out towards its label, so centring the arrow in the
 * grid lands the tip on the middle of the content it points at. The two differ
 * only in which side the tail sweeps from, which is the side its text sits on.
 *
 * Both are pointer-events: none, so neither can eat a click meant for the editor.
 */
function PlaygroundCallout({ target }: { target: 'source' | 'preview' }) {
  if (target === 'source') {
    return (
      <div className="pg-callout pg-callout-source" aria-hidden>
        <svg className="pg-callout-arrow" viewBox="0 0 36 48" fill="none">
          <path d="M31 41 C26 44, 15 40, 18 10" {...stroke} />
          <path d="M18 10 L13.3 16.5 M18 10 L21.3 17.3" {...stroke} />
        </svg>
        <span className="pg-callout-text">Edit here</span>
      </div>
    )
  }
  return (
    <div className="pg-callout pg-callout-preview" aria-hidden>
      <span className="pg-callout-text">or edit here</span>
      <svg className="pg-callout-arrow" viewBox="0 0 36 48" fill="none">
        <path d="M5 41 C10 44, 21 40, 18 10" {...stroke} />
        <path d="M18 10 L14.7 17.3 M18 10 L22.7 16.5" {...stroke} />
      </svg>
    </div>
  )
}

function CodeCard({ title, children }: { title: string; children: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const text = preRef.current?.textContent ?? ''
    void navigator.clipboard?.writeText(text)
    track('recipe_copied', { recipe: title })
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  return (
    <div className="code-block">
      <div className="code-block-head">
        <span className="code-block-title">{title}</span>
        <button type="button" className="btn btn-ghost btn-icon" onClick={copy} aria-label={`Copy ${title} example`}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <pre ref={preRef}>{children}</pre>
    </div>
  )
}

export default function App() {
  const [type, setType] = useState('flowchart')
  const [skin, setSkin] = useState<Skin>('dark')
  const { editor } = usePeleEditor(PRESETS.flowchart)

  // The headline runs on its own editor so editing it never disturbs the
  // playground below, and vice versa.
  const [heroInitial] = useState(initialHeroSource)
  const { editor: heroEditor } = usePeleEditor(heroInitial)
  const [heroSource, setHeroSource] = useState(heroInitial)
  useEffect(() => heroEditor.on('change', ({ code }) => setHeroSource(code.trim())), [heroEditor])

  useCanvasControlTracking()

  // Expanding hands off to the dedicated /playground page, carrying the
  // current source in the URL hash so nothing is lost in the jump.
  const goToPlayground = () => {
    track('playground_expanded')
    window.location.href = playgroundUrl(editor.code)
  }
  const [copied, setCopied] = useState(false)
  const [installCopied, setInstallCopied] = useState(false)
  const [ghStars, setGhStars] = useState<number | null>(null)

  // Fade the "Leave a star!" hint out as the "Open source · MIT" badge scrolls
  // up under the sticky navbar. We track the badge itself so the fade is tied
  // to the thing the user actually sees moving.
  const badgeRef = useRef<HTMLDivElement>(null)
  const [starHintOpacity, setStarHintOpacity] = useState(1)
  useEffect(() => {
    const badge = badgeRef.current
    if (!badge) return
    const navBottom = 80
    const compute = () => {
      const rect = badge.getBoundingClientRect()
      // Re-derive the fade origin every tick so a late web-font layout
      // shift or viewport resize doesn't leave the ratio stale.
      const startTop = rect.top + window.scrollY - navBottom
      if (startTop <= 0) return 0
      return Math.max(0, Math.min(1, (rect.top - navBottom) / startTop))
    }
    const onScroll = () => setStarHintOpacity(compute())
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const switchType = (next: string) => {
    setType(next)
    editor.setCode(PRESETS[next], 'api')
    track('preset_switched', { preset: next })
  }

  // The activation signals: did this visitor actually edit the diagram —
  // visually (canvas gesture) or textually (source pane)? Once per session
  // each, so live-commit keystrokes don't spew events.
  const editTracked = useRef({ canvas: false, code: false })
  useEffect(() => {
    return editor.on('change', ({ origin }) => {
      if (origin === 'canvas' && !editTracked.current.canvas) {
        editTracked.current.canvas = true
        track('playground_visual_edit')
      }
      if (origin === 'code' && !editTracked.current.code) {
        editTracked.current.code = true
        track('playground_code_edit')
      }
    })
  }, [editor])

  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        if (typeof d.stargazers_count === 'number') setGhStars(d.stargazers_count)
      })
      .catch(() => {})
  }, [])

  const starsLabel =
    ghStars == null ? 'Star' : ghStars >= 1000 ? `${(ghStars / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(ghStars)
  // Shared with the first-paint copy of the badge, which the build inlines into
  // index.html from the same module.
  const licenseLabel = HERO_LICENSE

  const copyInstall = () => {
    void navigator.clipboard?.writeText(INSTALL_CMD)
    track('install_copied')
    setInstallCopied(true)
    window.setTimeout(() => setInstallCopied(false), 1400)
  }
  const copySource = () => {
    void navigator.clipboard?.writeText(editor.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  const reset = () => editor.setCode(PRESETS[type], 'api')

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="site-header">
        <div className="container site-header-row">
          <a href="#top" className="brand">
            <Logo size={22} />
            Kilauea
          </a>
          <nav className="site-nav">
            <a href="#demo">Playground</a>
            <a href="#features">Features</a>
            <a href="#install">Install</a>
          </nav>
          <div className="site-header-actions">
            <div className="star-wrap">
              <a href={REPO_URL} className="btn btn-outline btn-sm" aria-label={`Star ${REPO} on GitHub`}>
                <GithubIcon />
                <span className="star-count">{starsLabel}</span>
              </a>
              <div aria-hidden className="site-star-hint" style={{ opacity: starHintOpacity }}>
                <span>Leave a star!</span>
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <path d="M4 30 C16 28, 26 20, 28 6" {...stroke} />
                  <path d="M28 6 L21.5 9.5 M28 6 L29.5 13" {...stroke} />
                </svg>
              </div>
            </div>
            <a href="#install" className="btn btn-primary btn-sm">
              npm install
            </a>
          </div>
        </div>
      </header>

      {/* The hero canvas is 100vw, which counts the scrollbar on platforms that
          reserve space for one, so it would sit a few pixels wider than the page
          and add a horizontal scrollbar. `clip` trims that without creating a
          scroll container, so the sticky header above is unaffected. */}
      <main id="top" style={{ overflowX: 'clip' }}>
        {/* Geometry for this block lives in site.css rather than inline, because
            the served document paints a copy of it before React exists (see
            hero-diagram.ts). Two sources for the same vertical rhythm means the
            mount visibly nudges the page; one means it does not. */}
        <section className="hero-section">
          <div ref={badgeRef} className="hero-badge">
            Open source · {licenseLabel} · React &amp; vanilla
          </div>

          {/* The canvas is not a card in the hero, it IS the hero: full-bleed to the
              window, on the page's own background, with no border, fill or radius of
              its own. Only the diagram is drawn, so the band reads as open page.

              It stays in flow rather than sitting behind the whole section. The canvas
              centres the diagram in itself, so a canvas spanning the section
              would centre on the section's midpoint, which on a phone lands on top
              of the copy. Owning its own band keeps that under control. */}
          {/* The heading is the text; the canvas is its rendering. Keeping them as
              separate elements matters: with the canvas inside the h1, the heading
              exposed the sentence once as its own text and then again, out of
              order, from the diagram's own labels. The canvas is hidden from
              assistive tech because it duplicates the heading and its editing is
              pointer-only, so exposing it would add confusion without adding a
              capability.

              This text deliberately does not track edits to the diagram. It is the
              page's heading, and rewriting it under an assistive-tech user as
              somebody types would churn the accessibility tree and the document
              outline for a change only the editing visitor made, to their own
              local copy. The live source is echoed in the hint line below instead. */}
          <h1 className="sr-only">{HERO_HEADLINE}</h1>
          <div className="hero-masthead" aria-hidden>
            <PeleCanvas
              editor={heroEditor}
              accentColor={ACCENT}
              className="site-demo-canvas"
              // The binding defaults the host to min-height 240, which fights the
              // absolute inset positioning: between 761 and 999px the band is
              // shorter than that, so the canvas outgrows the box and the diagram
              // drifts off centre into the hint below.
              style={{ backgroundColor: 'transparent', minHeight: 0 }}
              // The canvas host sets tabIndex 0, which would leave a tab stop
              // inside this aria-hidden subtree that announces nothing and does
              // nothing, since editing here is pointer-only.
              onReady={(view) => {
                view.container.tabIndex = -1
              }}
            />
          </div>
          <div className="hero-hint">
            <span className="hero-hint-lead">{HERO_HINT_LEAD}</span>
            <span>{HERO_HINT_BODY}</span>
            {/* the statement line only: "flowchart LR" is noise in a one-line hint */}
            <code>{heroSource.split('\n').slice(1).join(' ').replace(/\s+/g, ' ').trim()}</code>
          </div>
          <p className="hero-sub">{HERO_SUBHEAD}</p>
          <div className="hero-actions">
            <a href="/playground" className="btn btn-primary btn-lg">
              Open the playground
            </a>
            <a href="https://openknowledge.ai" target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">
              Try with Open Knowledge
              <ArrowUpRightIcon />
            </a>
            <a href="#install" className="btn btn-ghost btn-lg">
              Install
            </a>
          </div>
          <div className="install-cmd">
            <span className="install-cmd-prompt">$</span>
            <span>{INSTALL_CMD}</span>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={copyInstall}
              aria-label="Copy install command"
            >
              {installCopied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </section>

        <section id="demo" className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">Take it for a spin.</h2>
              <p className="section-lead">The real editor, running in your browser. Nothing to install.</p>
            </div>
            <div className="pg-frame">
              <div className="pg-toolbar">
                <div className="tabs pg-presets" role="tablist" aria-label="Diagram type">
                  {Object.keys(TYPE_LABELS).map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="tab"
                      className="tab"
                      aria-selected={type === k}
                      onClick={() => switchType(k)}
                    >
                      {TYPE_LABELS[k]}
                    </button>
                  ))}
                </div>
                <div className="pg-controls">
                  <SkinToggle skin={skin} onChange={setSkin} />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm pg-expand-btn"
                    onClick={goToPlayground}
                    aria-label="Open the full playground page with the current diagram"
                    title="Open the full playground"
                  >
                    <MaximizeIcon />
                    Expand
                  </button>
                </div>
              </div>

              <div className="pg-grid pg-grid-inline" data-skin={skin}>
                <div
                  className={
                    skin === 'dark'
                      ? 'pg-pane pg-code-pane pg-inline-pane demo-pane demo-pane-dark'
                      : 'pg-pane pg-code-pane pg-inline-pane demo-pane'
                  }
                >
                  <div className="pg-pane-head">
                    <span className="pg-filename">{type}.mmd</span>
                    <div className="pg-pane-actions">
                      <button type="button" className="btn btn-ghost btn-xs" onClick={copySource}>
                        {copied ? <CheckIcon /> : <CopyIcon />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button type="button" className="btn btn-ghost btn-xs" onClick={reset}>
                        <ResetIcon />
                        Reset
                      </button>
                    </div>
                  </div>
                  <CodeMirrorPane editor={editor} />
                  <PlaygroundCallout target="source" />
                  <div className="pg-callout-filler" />
                </div>

                <div className="pg-pane">
                  <div className="pg-pane-head">
                    <span className="pg-pane-title">Preview</span>
                    <span className="pg-hint pg-hint-long">
                      click to select · double-click to edit · alt + drag to connect · pinch to zoom
                    </span>
                    <span className="pg-hint pg-hint-short">tap to select · double-tap to edit · pinch to zoom</span>
                  </div>
                  <div className="pg-canvas-wrap">
                    <PeleCanvas
                      editor={editor}
                      accentColor={ACCENT}
                      panZoom
                      className="site-demo-canvas"
                      style={canvasStyle(skin)}
                    />
                    <PlaygroundCallout target="preview" />
                  </div>
                </div>
              </div>
            </div>
            <p className="section-note">
              Tip: click any box in the preview. The popover on the diagram edits it. Watch the source pane rewrite
              itself.
            </p>
          </div>
        </section>

        <section id="features" className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">Diagrams you can actually touch.</h2>
              <p className="section-lead">Fix a diagram fast. No re-learning Pele syntax to move one arrow.</p>
            </div>
            <div className="feature-grid">
              {FEATURES.map(({ icon: FeatureIcon, title, body }) => (
                <div key={title} className="feature">
                  <span className="feature-icon">
                    <FeatureIcon />
                  </span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="install" className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">Add it to your own editor.</h2>
              <p className="section-lead">The playground above is this exact package. Six recipes cover it all.</p>
            </div>
            <div className="code-grid">
              <CodeCard title="React · @kilauea/react">
                <span className="syn-cmt"># npm i @kilauea/react</span>
                {'\n'}
                <span className="syn-kw">import</span> {'{ PeleWysiwyg }'} <span className="syn-kw">from</span>{' '}
                <span className="syn-str">'@kilauea/react'</span>
                {'\n\n'}&lt;<span className="syn-id">PeleWysiwyg</span> <span className="syn-str">code</span>=
                {'{diagram}'} <span className="syn-str">onCodeChange</span>={'{setDiagram}'} /&gt;
              </CodeCard>
              <CodeCard title="Vanilla · @kilauea/core + @kilauea/dom">
                <span className="syn-cmt"># npm i @kilauea/core @kilauea/dom</span>
                {'\n'}
                <span className="syn-kw">import</span> {'{ PeleWysiwygEditor }'} <span className="syn-kw">from</span>{' '}
                <span className="syn-str">'@kilauea/core'</span>
                {'\n'}
                <span className="syn-kw">import</span> {'{ PeleCanvasView }'} <span className="syn-kw">from</span>{' '}
                <span className="syn-str">'@kilauea/dom'</span>
                {'\n\n'}
                <span className="syn-kw">const</span> editor = <span className="syn-kw">new</span>{' '}
                <span className="syn-id">PeleWysiwygEditor</span>({'{ '}
                <span className="syn-str">code</span>
                {' }'})
                {'\n'}
                <span className="syn-kw">new</span> <span className="syn-id">PeleCanvasView</span>({'{ '}
                <span className="syn-str">editor</span>, <span className="syn-str">container</span>
                {' }'})
              </CodeCard>
              <CodeCard title="CodeMirror pane · @kilauea/codemirror">
                <span className="syn-cmt"># npm i @kilauea/codemirror</span>
                {'\n'}
                <span className="syn-kw">import</span> {'{ PeleCodeMirror }'} <span className="syn-kw">from</span>{' '}
                <span className="syn-str">'@kilauea/codemirror'</span>
                {'\n\n'}
                <span className="syn-kw">new</span> <span className="syn-id">PeleCodeMirror</span>(host, editor)
                {'\n'}
                <span className="syn-cmt"># typing, highlights, undo, all shared with the canvas</span>
              </CodeCard>
              <CodeCard title="Monaco · @kilauea/monaco">
                <span className="syn-cmt"># npm i @kilauea/monaco  (bring your own monaco instance)</span>
                {'\n'}
                <span className="syn-kw">import</span> {'{ bindMonaco }'} <span className="syn-kw">from</span>{' '}
                <span className="syn-str">'@kilauea/monaco'</span>
                {'\n\n'}
                <span className="syn-kw">const</span> binding = <span className="syn-id">bindMonaco</span>(editor,
                monacoEditor)
                {'\n'}binding.<span className="syn-id">dispose</span>()
              </CodeCard>
              <CodeCard title="Headless · drive it from code">
                <span className="syn-cmt"># every gesture is also a semantic op</span>
                {'\n'}editor.<span className="syn-id">dispatch</span>({'{ '}
                <span className="syn-str">type</span>: <span className="syn-str">'renameNode'</span>,{' '}
                <span className="syn-str">id</span>: <span className="syn-str">'B'</span>,{' '}
                <span className="syn-str">label</span>: <span className="syn-str">'Valid?'</span>
                {' }'})
                {'\n'}editor.<span className="syn-id">dispatch</span>({'{ '}
                <span className="syn-str">type</span>: <span className="syn-str">'connect'</span>,{' '}
                <span className="syn-str">source</span>: <span className="syn-str">'A'</span>,{' '}
                <span className="syn-str">target</span>: <span className="syn-str">'C'</span>
                {' }'})
                {'\n'}editor.<span className="syn-id">undo</span>()
              </CodeCard>
              <CodeCard title="Theming · CSS variables">
                <span className="syn-cmt"># chrome follows --mw-* tokens; diagrams follow --pele-*</span>
                {'\n'}.mw-canvas {'{'}
                {'\n'}  <span className="syn-str">--mw-accent</span>: <span className="syn-id">#2BB39A</span>;
                {'\n'}  <span className="syn-str">--mw-chrome-bg</span>: <span className="syn-id">#09090B</span>;
                {'\n'}  <span className="syn-str">--mw-chrome-fg</span>: <span className="syn-id">#FAFAFA</span>;
                {'\n'}  <span className="syn-str">--pele-surface</span>: <span className="syn-id">#18181B</span>;
                {'\n'}  <span className="syn-str">--pele-border</span>: <span className="syn-id">#3F3F46</span>;
                {'\n'}{'}'}
                {'\n'}
                <span className="syn-cmt"># or per-instance: accentColor · renderOptions={'{ fontSize: 16 }'}</span>
              </CodeCard>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <div className="container site-footer-row">
            <div className="brand">
              <Logo size={18} />
              Kilauea
            </div>
            <div className="site-footer-links">
              <a href={REPO_URL}>GitHub</a>
              <a href="https://www.npmjs.com/package/@kilauea/react">npm</a>
            </div>
            <div className="site-footer-meta">{licenseLabel} licensed · built in the open</div>
          </div>
        </footer>
      </main>
    </div>
  )
}
