import { useEffect, useRef, type CSSProperties } from 'react'
import { EditorView } from '@codemirror/view'
import { PeleCodeMirror } from '@kilauea/codemirror'
import type { PeleWysiwygEditor } from '@kilauea/core'
import { track } from './analytics'

/** Sample diagrams + chrome shared by the inline demo and /playground. */

export const PRESETS: Record<string, string> = {
  flowchart: `flowchart LR
    A[Write a doc] --> B{Needs a diagram?}
    B -->|Yes| C[Click a node to edit]
    B -->|No| D[Keep writing]
    C --> E[Source stays in sync]`,
  sequence: `sequenceDiagram
    participant H as Human
    participant E as Editor
    participant D as Diagram
    H->>E: Click a node
    E->>D: Rewrite label
    D-->>E: Re-render
    E-->>H: Source in sync`,
  class: `classDiagram
    class Editor {
      +String source
      +render()
      +selectNode()
    }
    class Diagram {
      +Node[] nodes
      +Edge[] edges
    }
    Editor --> Diagram : drives`,
  state: `stateDiagram-v2
    [*] --> Editing
    Editing --> Previewing : render
    Previewing --> Editing : click node
    Previewing --> [*] : done`,
  er: `erDiagram
    DOC ||--o{ DIAGRAM : contains
    DIAGRAM ||--|{ NODE : has
    NODE }o--o{ EDGE : connects`,
  gantt: `gantt
    title Release plan
    dateFormat YYYY-MM-DD
    section Build
    Editor core      :done, a1, 2026-01-01, 20d
    Visual editing   :active, a2, after a1, 15d
    section Ship
    Docs             :a3, after a2, 10d
    v1.0             :milestone, m1, after a3, 0d`,
}

export const TYPE_LABELS: Record<string, string> = {
  flowchart: 'Flowchart',
  sequence: 'Sequence',
  class: 'Class',
  state: 'State',
  er: 'ER',
  gantt: 'Gantt',
}

export const mono = "'Geist Mono', ui-monospace, monospace"

/** Selection/connect highlight on every site canvas; matches `--accent` in site.css. */
export const ACCENT = '#2BB39A'

export type Skin = 'light' | 'dark'

/**
 * One pele palette per preview theme, both on shadcn's zinc scale: outlined
 * nodes, quiet connectors, clusters as a half-step darker tier. pele reads
 * these custom properties live, so they go on the canvas `style` with no
 * re-render.
 */
function themeVars(mode: Skin): CSSProperties {
  const vars: Record<string, string> =
    mode === 'dark'
      ? {
          '--pele-bg': '#09090B',
          '--pele-fg': '#FAFAFA',
          '--pele-muted': '#A1A1AA',
          '--pele-line': '#71717A',
          '--pele-surface': '#18181B',
          '--pele-surface-alt': '#111113',
          '--pele-border': '#3F3F46',
          '--pele-accent': ACCENT,
        }
      : {
          '--pele-bg': '#FFFFFF',
          '--pele-fg': '#09090B',
          '--pele-muted': '#71717A',
          '--pele-line': '#A1A1AA',
          '--pele-surface': '#F4F4F5',
          '--pele-surface-alt': '#FAFAFA',
          '--pele-border': '#D4D4D8',
          '--pele-accent': ACCENT,
        }
  vars['--pele-font'] = "'Geist', ui-sans-serif, system-ui, sans-serif"
  vars['--pele-font-mono'] = mono
  return vars as CSSProperties
}

/**
 * Canvas style for a playground preview pane: the diagram palette plus the
 * pane's dot grid. Colours come from the `--pane-*` properties the grid's
 * `data-skin` sets, so the canvas and its pane chrome cannot disagree.
 */
export function canvasStyle(mode: Skin): CSSProperties {
  return {
    ...themeVars(mode),
    backgroundColor: 'var(--pane-bg)',
    backgroundImage: 'radial-gradient(var(--pane-dot) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  }
}

/** Preview-theme switch for both playgrounds: a two-item segmented control. */
export function SkinToggle({ skin, onChange }: { skin: Skin; onChange: (skin: Skin) => void }) {
  return (
    <div className="tabs" role="group" aria-label="Preview theme">
      <button type="button" className="tab" aria-pressed={skin === 'light'} onClick={() => onChange('light')}>
        Light
      </button>
      <button type="button" className="tab" aria-pressed={skin === 'dark'} onClick={() => onChange('dark')}>
        Dark
      </button>
    </div>
  )
}

/** Monochrome mark: inherits `color`, so it follows whatever text it sits in. */
export function Logo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" style={{ flex: 'none' }} aria-hidden>
      <rect x="1" y="8.5" width="9" height="9" rx="2.4" fill="currentColor" />
      <rect x="16" y="1" width="9" height="9" rx="2.4" fill="currentColor" />
      <rect x="16.75" y="16.75" width="7.5" height="7.5" rx="1.9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 12.2 H14 Q15 12.2 15 11.2 V6.8 Q15 5.8 16 5.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10 13.8 H14 Q15 13.8 15 14.8 V19.2 Q15 20.2 16 20.2"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * The demo's source pane IS the published CodeMirror binding: two-way sync,
 * pele syntax highlighting, entity highlights on canvas selection, and the
 * engine's unified undo — nothing site-specific beyond styling.
 */
export function CodeMirrorPane({ editor }: { editor: PeleWysiwygEditor }) {
  const hostRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!hostRef.current) return
    // wrap long lines — on phones the pane is full-width but short, and a
    // clipped line with no scroll affordance reads as missing code
    const cm = new PeleCodeMirror(hostRef.current, editor, [EditorView.lineWrapping])
    return () => cm.destroy()
  }, [editor])
  return <div ref={hostRef} className="demo-cm" />
}

/**
 * Tracks clicks on the canvas corner zoom controls (zoom in / zoom out /
 * fit). The buttons are rendered by @kilauea/dom, so the site listens by
 * delegation instead of teaching the package about analytics.
 */
export function useCanvasControlTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as Element | null)?.closest?.('.mw-zoom-btn')
      if (!btn) return
      const title = btn.getAttribute('title') ?? ''
      const control = /out/i.test(title) ? 'zoom-out' : /in\b/i.test(title) ? 'zoom-in' : 'fit'
      track('canvas_zoom_control', { control })
    }
    // capture phase: the package's buttons stopPropagation on their clicks
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
}

// ---- code <-> URL hash codec ----
// The playground keeps the current source in `#code=<base64url(utf8)>` so the
// address bar is always a share link. No compression: sample-sized diagrams
// stay comfortably under URL limits, and zero deps beats shaving bytes.

export function encodeCode(code: string): string {
  const bytes = new TextEncoder().encode(code)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

export function decodeCode(encoded: string): string | null {
  try {
    const b64 = encoded.replaceAll('-', '+').replaceAll('_', '/')
    const bin = atob(b64)
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
  } catch {
    return null
  }
}

/** URL for the dedicated playground carrying `code` (omit for the default sample). */
export function playgroundUrl(code?: string): string {
  return code ? `/playground#code=${encodeCode(code)}` : '/playground'
}

export function codeFromHash(hash: string): string | null {
  const m = hash.match(/code=([A-Za-z0-9_-]+)/)
  return m ? decodeCode(m[1]) : null
}
