import { useEffect, useRef, useState } from 'react'
import {
  DIAGRAM_TYPES,
  PARTICIPANT_TYPES,
  type PeleWysiwygEditor,
  type ParticipantType,
  type ShapeId,
} from '@kilauea/core'
import type { PeleCanvasView, Tool } from '@kilauea/dom'
import { PeleCanvas, usePeleEditor } from '@kilauea/react'
import { PeleCodeMirror } from '@kilauea/codemirror'
import { MonacoPane } from './MonacoPane'
import { SAMPLES } from '../../js-playground/src/samples'

const FONT = '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif'
const FONT_MONO = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, Menlo, monospace'

const SERIES_VIBRANT = ['#3784ff', '#a78bfa', '#4fae72', '#d9a13c', '#d97757', '#69a3ff', '#f0716b', '#8fb8ff']

function series(colors: string[]): Record<string, string> {
  return Object.fromEntries(colors.map((c, i) => [`--pele-series-${i + 1}`, c]))
}

/** pele CSS-variable palettes; applied as inline style on the canvas host (live, no re-render) */
const PALETTES: Record<string, Record<string, string>> = {
  // the playground's default: black bg, zinc surfaces, blue-ish accent
  ink: {
    '--pele-bg': '#000000',
    '--pele-fg': '#ededed',
    '--pele-muted': '#a1a1a1',
    '--pele-line': '#8f8f8f',
    '--pele-surface': '#111111',
    '--pele-surface-alt': '#1a1a1a',
    '--pele-border': '#3f3f3f',
    '--pele-accent': '#69a3ff',
    '--pele-critical': '#d97757',
    '--pele-error': '#f0716b',
    '--pele-font': FONT,
    '--pele-font-mono': FONT_MONO,
    ...series(SERIES_VIBRANT),
  },
  dark: {
    '--pele-bg': '#1e1e1e',
    '--pele-fg': '#e6e6e6',
    '--pele-muted': '#a6a6a6',
    '--pele-line': '#9a9a9a',
    '--pele-surface': '#2b2b2b',
    '--pele-surface-alt': '#363636',
    '--pele-border': '#555555',
    '--pele-accent': '#8b7cf6',
    '--pele-critical': '#e5694f',
    '--pele-error': '#f0716b',
    '--pele-font': FONT,
    '--pele-font-mono': FONT_MONO,
    ...series(['#8b7cf6', '#4fb3d9', '#5fb878', '#e0b24a', '#e5694f', '#c678dd', '#56c2b6', '#e07a9b']),
  },
  light: {
    '--pele-bg': '#ffffff',
    '--pele-fg': '#1f1f1f',
    '--pele-muted': '#6b6b6b',
    '--pele-line': '#6e6e6e',
    '--pele-surface': '#f4f4f5',
    '--pele-surface-alt': '#e9e9ec',
    '--pele-border': '#c9c9d0',
    '--pele-accent': '#2563eb',
    '--pele-critical': '#d9480f',
    '--pele-error': '#d92d20',
    '--pele-font': FONT,
    '--pele-font-mono': FONT_MONO,
    ...series(['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#db2777', '#4b5563']),
  },
  forest: {
    '--pele-bg': '#f3f7f1',
    '--pele-fg': '#1d2b1f',
    '--pele-muted': '#5d7360',
    '--pele-line': '#4f6b52',
    '--pele-surface': '#dcead7',
    '--pele-surface-alt': '#c8dcc2',
    '--pele-border': '#8fb08a',
    '--pele-accent': '#2e7d32',
    '--pele-critical': '#c0562b',
    '--pele-error': '#b3261e',
    '--pele-font': FONT,
    '--pele-font-mono': FONT_MONO,
    ...series(['#2e7d32', '#6a9f3c', '#00897b', '#c9a227', '#c0562b', '#5c8a97', '#8d6e63', '#7b8f3a']),
  },
  neutral: {
    '--pele-bg': '#fafafa',
    '--pele-fg': '#262626',
    '--pele-muted': '#737373',
    '--pele-line': '#737373',
    '--pele-surface': '#f0f0f0',
    '--pele-surface-alt': '#e5e5e5',
    '--pele-border': '#bdbdbd',
    '--pele-accent': '#404040',
    '--pele-critical': '#b45309',
    '--pele-error': '#b91c1c',
    '--pele-font': FONT,
    '--pele-font-mono': FONT_MONO,
    ...series(['#404040', '#737373', '#a3a3a3', '#525252', '#8a8a8a', '#2b2b2b', '#b0b0b0', '#666666']),
  },
}

const SHAPES: Array<{ id: ShapeId; label: string }> = [
  { id: 'rect', label: 'Rectangle' },
  { id: 'round', label: 'Rounded' },
  { id: 'stadium', label: 'Stadium' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'circle', label: 'Circle' },
  { id: 'cylinder', label: 'Cylinder' },
  { id: 'subroutine', label: 'Subroutine' },
]

export default function App() {
  const [sampleIndex, setSampleIndex] = useState(0)
  const [theme, setTheme] = useState('ink')
  const [readOnly, setReadOnly] = useState(false)

  const sample = SAMPLES[sampleIndex]

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" />
          kilauea
          <span className="sep">/</span>
          <span className="sub">playground</span>
        </div>
        <div className="controls">
          <select value={theme} onChange={(e) => setTheme(e.target.value)} title="Diagram palette">
            {Object.keys(PALETTES).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <label className="switch">
            <input type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
            Read-only
          </label>
          <a href="https://github.com/prdlk/kilauea" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </header>
      <div className="body">
        <aside className="sidebar">
          <div className="side-label">Diagram types</div>
          {SAMPLES.map((s, i) => {
            const t = DIAGRAM_TYPES.find((d) => d.id === s.typeId)
            return (
              <button key={s.title} className={`side-item${i === sampleIndex ? ' active' : ''}`} onClick={() => setSampleIndex(i)}>
                <i className={`dot ${t?.capability ?? 'render'}`} />
                {s.title}
              </button>
            )
          })}
          <div className="legend">
            <span><i className="dot edit" /> editable</span>
            <span><i className="dot render" /> render</span>
          </div>
        </aside>
        <Workspace key={sampleIndex} code={sample.code} theme={theme} readOnly={readOnly} />
      </div>
    </div>
  )
}

function Workspace({ code, theme, readOnly }: { code: string; theme: string; readOnly: boolean }) {
  const { editor } = usePeleEditor(code)
  const [view, setView] = useState<PeleCanvasView | null>(null)
  const [tool, setToolState] = useState<Tool>('select')
  const [status, setStatus] = useState<string | null>(null)
  const [pane, setPane] = useState<'codemirror' | 'monaco'>('codemirror')

  // theme changes flow through --pele-* CSS variables on the canvas (no re-render)

  // subscribe to the editor so toolbar state (undo/redo/selection) stays live
  useEditorCode(editor)
  // status tracks render outcomes; the view emits after every (debounced)
  // render, including the undo-back-to-last-good path
  useEffect(() => {
    if (!view) return
    setStatus(view.renderError)
    return view.on('render', () => setStatus(view.renderError))
  }, [view])

  const setTool = (t: Tool) => {
    view?.setTool(t)
    setToolState(t)
  }

  const typeInfo = editor.result.typeInfo
  const editable = typeInfo?.capability === 'edit' && !readOnly

  return (
    <>
      <main className="main">
        <div className={`toolbar${editable ? '' : ' disabled'}`}>
          <button className={tool === 'select' ? 'primary' : ''} onClick={() => setTool('select')}>Select</button>
          <button className={tool === 'connect' ? 'primary' : ''} onClick={() => setTool('connect')}>Connect</button>
          <TypeTools editor={editor} view={view} />
          <span className="spacer" />
          <button disabled={!editor.selection.length} className="danger" onClick={() => editor.deleteEntities(editor.selection)}>Delete</button>
          <button disabled={!editor.canUndo} onClick={() => editor.undo()}>Undo</button>
          <button disabled={!editor.canRedo} onClick={() => editor.redo()}>Redo</button>
        </div>
        <PeleCanvas
          editor={editor}
          accentColor="#69a3ff"
          readOnly={readOnly}
          onReady={setView}
          className="canvas"
          style={{ ...PALETTES[theme], height: '100%' }}
        />
      </main>
      <section className="codepanel">
        <div className="panel-title">
          <span className="panel-title-left">
            Pele source
            <span className="seg">
              <button className={pane === 'codemirror' ? 'on' : ''} onClick={() => setPane('codemirror')}>
                CodeMirror
              </button>
              <button className={pane === 'monaco' ? 'on' : ''} onClick={() => setPane('monaco')}>
                Monaco
              </button>
            </span>
          </span>
          {typeInfo && (
            <span className={`badge${typeInfo.capability === 'edit' ? ' edit' : ''}`}>
              {typeInfo.name} · {typeInfo.capability === 'edit' ? 'WYSIWYG' : 'render'}
            </span>
          )}
        </div>
        {pane === 'monaco' ? <MonacoPane editor={editor} /> : <CodePane editor={editor} />}
        <div className="statusbar">
          {status ? <span className="err">✕ {status}</span> : <span className="ok">✓ renders</span>}
        </div>
      </section>
    </>
  )
}

/** re-render on document changes */
function useEditorCode(editor: PeleWysiwygEditor) {
  const [code, setCode] = useState(editor.code)
  useEffect(() => editor.on('change', ({ code: next }) => setCode(next)), [editor])
  return code
}

function TypeTools({ editor, view }: { editor: PeleWysiwygEditor; view: PeleCanvasView | null }) {
  const typeId = editor.result.typeInfo?.id
  const openEditorSoon = (created?: string[]) => {
    const id = created?.[0]
    if (id) setTimeout(() => view?.editEntityLabel(id), 350)
  }

  if (typeId === 'flowchart') {
    return (
      <>
        <select value="" title="Add a node" onChange={(e) => e.target.value && view?.addNode(e.target.value as ShapeId)}>
          <option value="">+ Node…</option>
          {SHAPES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <DirectionSelect
          value={editor.result.flowchart?.direction ?? 'TD'}
          options={['TD', 'LR', 'BT', 'RL']}
          onChange={(d) => editor.dispatch({ type: 'setDirection', direction: d })}
        />
      </>
    )
  }
  if (typeId === 'sequence') {
    return (
      <>
        <select value="" title="Add a participant" onChange={(e) => e.target.value && editor.dispatch({ type: 'seq.addParticipant', ptype: e.target.value as ParticipantType })}>
          <option value="">+ Participant…</option>
          {PARTICIPANT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          className={editor.result.sequence?.autonumber.enabled ? 'primary' : ''}
          onClick={() => editor.dispatch({ type: 'seq.toggleAutonumber' })}
        >
          # Autonumber
        </button>
      </>
    )
  }
  if (typeId === 'state') {
    return (
      <>
        <button onClick={() => openEditorSoon(editor.dispatch({ type: 'st.addState', label: 'New state' })?.created)}>+ State</button>
        <DirectionSelect
          value={editor.result.state?.direction?.value ?? 'TB'}
          options={['TB', 'LR', 'BT', 'RL']}
          onChange={(d) => editor.dispatch({ type: 'st.setDirection', direction: d })}
        />
      </>
    )
  }
  if (typeId === 'class') {
    return (
      <>
        <button onClick={() => openEditorSoon(editor.dispatch({ type: 'cl.addClass' })?.created)}>+ Class</button>
        <DirectionSelect
          value={editor.result.classGraph?.direction?.value ?? 'TB'}
          options={['TB', 'LR', 'BT', 'RL']}
          onChange={(d) => editor.dispatch({ type: 'cl.setDirection', direction: d })}
        />
      </>
    )
  }
  if (typeId === 'er') {
    return <button onClick={() => openEditorSoon(editor.dispatch({ type: 'er.addEntity' })?.created)}>+ Entity</button>
  }
  if (typeId === 'pie') {
    return <button onClick={() => openEditorSoon(editor.dispatch({ type: 'pie.addSlice' })?.created)}>+ Slice</button>
  }
  if (typeId === 'gantt') {
    return <button onClick={() => openEditorSoon(editor.dispatch({ type: 'gantt.addTask' })?.created)}>+ Task</button>
  }
  if (editor.result.lineItems) {
    return <button onClick={() => openEditorSoon(editor.dispatch({ type: 'li.addItem' })?.created)}>+ Item</button>
  }
  return null
}

function DirectionSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (d: string) => void }) {
  const normalized = value === 'TD' && options.includes('TB') ? 'TB' : value === 'TB' && options.includes('TD') ? 'TD' : value
  return (
    <select value={normalized} title="Layout direction" onChange={(e) => onChange(e.target.value)}>
      {options.map((d) => (
        <option key={d} value={d}>{d}</option>
      ))}
    </select>
  )
}

function CodePane({ editor }: { editor: PeleWysiwygEditor }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const cm = new PeleCodeMirror(ref.current, editor)
    return () => cm.destroy()
  }, [editor])
  return <div className="codepane" ref={ref} />
}
