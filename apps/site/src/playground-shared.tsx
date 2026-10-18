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

export const mono = "'JetBrains Mono', monospace"

/**
 * One pele palette per color mode — no user-facing theme picker. Light is the
 * site's paper palette (cream surfaces, teal borders, gold accents). Dark
 * transposes Open Knowledge's treatment — quiet node fills, muted connectors,
 * clusters as darker tiers — into the site's warm dark tones. pele reads these
 * custom properties live, so they go on the canvas `style` with no re-render.
 */
export function themeVars(mode: 'light' | 'dark'): CSSProperties {
  const vars: Record<string, string> =
    mode === 'dark'
      ? {
          '--pele-bg': '#17140F',
          '--pele-fg': '#EDE7DA',
          '--pele-muted': '#A39D90',
          '--pele-line': '#6B655A',
          '--pele-surface': '#26221B',
          '--pele-surface-alt': '#1E1A14',
          '--pele-border': '#3A342A',
          '--pele-accent': '#C9A227',
        }
      : {
          '--pele-bg': '#FFFFFF',
          '--pele-fg': '#1C1A17',
          '--pele-muted': '#6B6559',
          '--pele-line': '#8A9B96',
          '--pele-surface': '#EAF3F0',
          '--pele-surface-alt': '#FBF9F4',
          '--pele-border': '#0E7C6B',
          '--pele-accent': '#C9A227',
          '--pele-series-1': '#0E7C6B',
          '--pele-series-2': '#C9A227',
        }
  vars['--pele-font'] = '"Inter", sans-serif'
  vars['--pele-font-mono'] = mono
  return vars as CSSProperties
}

export function Logo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" style={{ flex: 'none' }}>
      <rect x="1" y="8.5" width="9" height="9" rx="2.4" fill="#0E7C6B" />
      <rect x="16" y="1" width="9" height="9" rx="2.4" fill="#1C1A17" />
      <rect x="16" y="16" width="9" height="9" rx="2.4" fill="#C9A227" />
      <path
        d="M10 12.2 H14 Q15 12.2 15 11.2 V6.8 Q15 5.8 16 5.8"
        stroke="#1C1A17"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M10 13.8 H14 Q15 13.8 15 14.8 V19.2 Q15 20.2 16 20.2"
        stroke="#C9A227"
        strokeWidth="1.6"
        fill="none"
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
