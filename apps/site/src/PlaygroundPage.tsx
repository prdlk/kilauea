import { useEffect, useMemo, useRef, useState } from 'react'
import { PeleCanvas, usePeleEditor } from '@kilauea/react'
import { track } from './analytics'
import { CheckIcon, ChevronDownIcon, CopyIcon, LinkIcon } from './icons'
import {
  ACCENT,
  CodeMirrorPane,
  Logo,
  PRESETS,
  SkinToggle,
  TYPE_LABELS,
  canvasStyle,
  codeFromHash,
  encodeCode,
  useCanvasControlTracking,
  type Skin,
} from './playground-shared'

/**
 * The dedicated playground at /playground. The address bar is the document:
 * every edit lands in `#code=` (debounced replaceState), so a refresh keeps
 * your work and copying the URL shares it. Samples live in a menu that
 * resets the source to the chosen diagram type.
 */
export default function PlaygroundPage() {
  const initialCode = useMemo(() => codeFromHash(window.location.hash) ?? PRESETS.flowchart, [])
  const { editor } = usePeleEditor(initialCode)
  useCanvasControlTracking()

  const [skin, setSkin] = useState<Skin>('dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // keep the URL current with the source (debounced; replaceState adds no
  // history entries, so back/forward still just leaves the page)
  useEffect(() => {
    let timer: number | undefined
    const off = editor.on('change', () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        window.history.replaceState(null, '', `#code=${encodeCode(editor.code)}`)
      }, 400)
    })
    return () => {
      window.clearTimeout(timer)
      off()
    }
  }, [editor])

  // pasting a share link into an already-open tab only changes the hash (no
  // reload) — adopt the incoming code so the link still "opens"
  useEffect(() => {
    const onHash = () => {
      const incoming = codeFromHash(window.location.hash)
      if (incoming != null && incoming !== editor.code) {
        editor.setCode(incoming, 'api')
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [editor])

  // the activation signals, same shape as the inline demo's
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

  // samples menu: outside click / Esc closes
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const loadSample = (k: string) => {
    editor.setCode(PRESETS[k], 'api')
    setMenuOpen(false)
    track('preset_switched', { preset: k, surface: 'playground-page' })
  }

  const copySource = () => {
    void navigator.clipboard?.writeText(editor.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const share = () => {
    // make sure the hash is current before copying (the debounce may not
    // have fired yet)
    window.history.replaceState(null, '', `#code=${encodeCode(editor.code)}`)
    void navigator.clipboard?.writeText(window.location.href)
    track('share_link_copied')
    setShareCopied(true)
    window.setTimeout(() => setShareCopied(false), 1400)
  }

  return (
    <div className="pg-page">
      <div className="pg-toolbar">
        <a href="/" className="brand">
          <Logo size={20} />
          Kilauea
          <span className="brand-suffix">Playground</span>
        </a>
        <div className="pg-controls">
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              Samples
              <ChevronDownIcon />
            </button>
            {menuOpen && (
              <div role="menu" className="menu">
                <span className="menu-label">Load sample</span>
                {Object.keys(TYPE_LABELS).map((k) => (
                  <button key={k} type="button" role="menuitem" className="menu-item" onClick={() => loadSample(k)}>
                    {TYPE_LABELS[k]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <SkinToggle skin={skin} onChange={setSkin} />
          <button type="button" className="btn btn-primary btn-sm pg-share-btn" onClick={share}>
            {shareCopied ? <CheckIcon /> : <LinkIcon />}
            {shareCopied ? 'Link copied' : 'Share'}
          </button>
        </div>
      </div>

      <div className="pg-grid pg-grid-full" data-skin={skin}>
        <div className={skin === 'dark' ? 'pg-pane pg-code-pane demo-pane demo-pane-dark' : 'pg-pane pg-code-pane demo-pane'}>
          <div className="pg-pane-head">
            <span className="pg-filename">diagram.mmd</span>
            <div className="pg-pane-actions">
              <button type="button" className="btn btn-ghost btn-xs" onClick={copySource}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <CodeMirrorPane editor={editor} />
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
            <PeleCanvas editor={editor} accentColor={ACCENT} panZoom className="site-demo-canvas" style={canvasStyle(skin)} />
          </div>
        </div>
      </div>
    </div>
  )
}
