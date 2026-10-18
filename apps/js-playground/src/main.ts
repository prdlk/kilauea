import {
  MermaidWysiwygEditor,
  DIAGRAM_TYPES,
  PARTICIPANT_TYPES,
  type ShapeId,
  type EdgeLine,
  type EdgeArrow,
  type ParticipantType,
} from '@visimer/core'
import { MermaidCanvasView, type Tool } from '@visimer/dom'
import { MermaidCodeMirror } from '@visimer/codemirror'
import { SAMPLES } from './samples'
import './style.css'

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T

const sidebarEl = $('#sidebar')
const canvasEl = $('#canvas')
const toolbarEl = $('#toolbar')
const inspectorEl = $('#inspector')
const statusbarEl = $('#statusbar')
const typebadgeEl = $('#typebadge')
const themeSel = $('#theme') as unknown as HTMLSelectElement
const accentInput = $('#accent') as unknown as HTMLInputElement
const readonlyChk = $('#readonly') as unknown as HTMLInputElement

const FONT = '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif'
const FONT_MONO = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, Menlo, monospace'

function series(colors: string[]): Record<string, string> {
  return Object.fromEntries(colors.map((c, i) => [`--pele-series-${i + 1}`, c]))
}

/** pele CSS-variable palettes, applied to the canvas element by `applyPalette` (live, no re-render) */
const PALETTES: Record<string, Record<string, string>> = {
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
    ...series(['#3784ff', '#a78bfa', '#4fae72', '#d9a13c', '#d97757', '#69a3ff', '#f0716b', '#8fb8ff']),
  },
  dark: {
    '--pele-bg': '#0b1020',
    '--pele-fg': '#e2e8f0',
    '--pele-muted': '#94a3b8',
    '--pele-line': '#7c89a8',
    '--pele-surface': '#111731',
    '--pele-surface-alt': '#1a2142',
    '--pele-border': '#3a4670',
    '--pele-accent': '#818cf8',
    '--pele-critical': '#f59e0b',
    '--pele-error': '#f87171',
    ...series(['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#c084fc', '#22d3ee', '#f472b6']),
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
    ...series(['#404040', '#737373', '#a3a3a3', '#525252', '#8a8a8a', '#2b2b2b', '#b0b0b0', '#666666']),
  },
}

function applyPalette(name: string) {
  canvasEl.style.setProperty('--pele-font', FONT)
  canvasEl.style.setProperty('--pele-font-mono', FONT_MONO)
  for (const [k, v] of Object.entries(PALETTES[name] ?? PALETTES.dark)) canvasEl.style.setProperty(k, v)
}

let editor: MermaidWysiwygEditor
let view: MermaidCanvasView
let codePane: MermaidCodeMirror | null = null

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

// ---------- toolbar ----------

function buildToolbar() {
  toolbarEl.innerHTML = ''
  const editable = editor.result.typeInfo?.capability === 'edit' && !readonlyChk.checked
  toolbarEl.classList.toggle('disabled', !editable)

  const btn = (label: string, title: string, onClick: () => void, cls = '') => {
    const b = document.createElement('button')
    b.textContent = label
    b.title = title
    b.className = cls
    b.addEventListener('click', onClick)
    toolbarEl.appendChild(b)
    return b
  }

  const selectBtn = btn('Select', 'Select tool (click entities, Shift-click for multi)', () => setTool('select'), 'tool')
  selectBtn.dataset.tool = 'select'
  const connectBtn = btn(
    'Connect',
    'Connect tool: drag between nodes/participants (or Alt-drag anytime)',
    () => setTool('connect'),
    'tool',
  )
  connectBtn.dataset.tool = 'connect'

  const typeId = editor.result.typeInfo?.id
  const isSequence = typeId === 'sequence'

  if (editor.result.lineItems) {
    const addBtn = document.createElement('button')
    addBtn.textContent = '+ Item'
    addBtn.title = 'Add an item line'
    addBtn.addEventListener('click', () => {
      const res = editor.dispatch({ type: 'li.addItem' })
      const created = res?.created?.[0]
      if (created) setTimeout(() => view.editEntityLabel(created), 350)
    })
    toolbarEl.appendChild(addBtn)
  } else if (typeId === 'gantt') {
    const addBtn = document.createElement('button')
    addBtn.textContent = '+ Task'
    addBtn.title = 'Add a task to the last section'
    addBtn.addEventListener('click', () => {
      const res = editor.dispatch({ type: 'gantt.addTask' })
      const created = res?.created?.[0]
      if (created) setTimeout(() => view.editEntityLabel(created), 350)
    })
    toolbarEl.appendChild(addBtn)
  } else if (typeId === 'pie') {
    const addBtn = document.createElement('button')
    addBtn.textContent = '+ Slice'
    addBtn.title = 'Add a slice'
    addBtn.addEventListener('click', () => {
      const res = editor.dispatch({ type: 'pie.addSlice' })
      const created = res?.created?.[0]
      if (created) setTimeout(() => view.editEntityLabel(created), 350)
    })
    toolbarEl.appendChild(addBtn)
  } else if (typeId === 'er') {
    const addBtn = document.createElement('button')
    addBtn.textContent = '+ Entity'
    addBtn.title = 'Add an entity'
    addBtn.addEventListener('click', () => {
      const res = editor.dispatch({ type: 'er.addEntity' })
      const created = res?.created?.[0]
      if (created) setTimeout(() => view.editEntityLabel(created), 350)
    })
    toolbarEl.appendChild(addBtn)
  } else if (typeId === 'class') {
    const addBtn = document.createElement('button')
    addBtn.textContent = '+ Class'
    addBtn.title = 'Add a class'
    addBtn.addEventListener('click', () => {
      const res = editor.dispatch({ type: 'cl.addClass' })
      const created = res?.created?.[0]
      if (created) setTimeout(() => view.editEntityLabel(created), 350)
    })
    toolbarEl.appendChild(addBtn)

    const dirSel = document.createElement('select')
    dirSel.title = 'Layout direction'
    dirSel.innerHTML = ['TB', 'LR', 'BT', 'RL'].map((d) => `<option value="${d}">${d}</option>`).join('')
    const dir = editor.result.classGraph?.direction?.value
    if (dir) dirSel.value = dir === 'TD' ? 'TB' : dir
    dirSel.addEventListener('change', () => editor.dispatch({ type: 'cl.setDirection', direction: dirSel.value }))
    toolbarEl.appendChild(dirSel)
  } else if (typeId === 'state') {
    const addBtn = document.createElement('button')
    addBtn.textContent = '+ State'
    addBtn.title = 'Add a state'
    addBtn.addEventListener('click', () => {
      const res = editor.dispatch({ type: 'st.addState', label: 'New state' })
      const created = res?.created?.[0]
      if (created) setTimeout(() => view.editEntityLabel(created), 350)
    })
    toolbarEl.appendChild(addBtn)

    const dirSel = document.createElement('select')
    dirSel.title = 'Layout direction'
    dirSel.innerHTML = ['TB', 'LR', 'BT', 'RL']
      .map((d) => `<option value="${d}">${d === 'TB' ? 'Top-down' : d === 'LR' ? 'Left-right' : d === 'BT' ? 'Bottom-up' : 'Right-left'}</option>`)
      .join('')
    const dir = editor.result.state?.direction?.value
    if (dir) dirSel.value = dir === 'TD' ? 'TB' : dir
    dirSel.addEventListener('change', () => editor.dispatch({ type: 'st.setDirection', direction: dirSel.value }))
    toolbarEl.appendChild(dirSel)
  } else if (isSequence) {
    const addSel = document.createElement('select')
    addSel.title = 'Add a participant'
    addSel.innerHTML =
      `<option value="">+ Participant…</option>` +
      PARTICIPANT_TYPES.map((t) => `<option value="${t}">${t}</option>`).join('')
    addSel.addEventListener('change', () => {
      if (addSel.value) {
        editor.dispatch({ type: 'seq.addParticipant', ptype: addSel.value as ParticipantType })
      }
      addSel.value = ''
    })
    toolbarEl.appendChild(addSel)

    const autoBtn = document.createElement('button')
    const autoOn = () => editor.result.sequence?.autonumber.enabled ?? false
    autoBtn.textContent = '# Autonumber'
    autoBtn.title = 'Toggle mermaid autonumber'
    autoBtn.className = autoOn() ? 'active' : ''
    autoBtn.addEventListener('click', () => editor.dispatch({ type: 'seq.toggleAutonumber' }))
    toolbarEl.appendChild(autoBtn)
  } else {
    const addSel = document.createElement('select')
    addSel.title = 'Add a node'
    addSel.innerHTML =
      `<option value="">+ Add node…</option>` + SHAPES.map((s) => `<option value="${s.id}">${s.label}</option>`).join('')
    addSel.addEventListener('change', () => {
      if (addSel.value) view.addNode(addSel.value as ShapeId)
      addSel.value = ''
    })
    toolbarEl.appendChild(addSel)

    const dirSel = document.createElement('select')
    dirSel.title = 'Layout direction'
    dirSel.innerHTML = ['TD', 'LR', 'BT', 'RL']
      .map((d) => `<option value="${d}">${d === 'TD' ? 'Top-down' : d === 'LR' ? 'Left-right' : d === 'BT' ? 'Bottom-up' : 'Right-left'}</option>`)
      .join('')
    const dir = editor.result.flowchart?.direction
    if (dir) dirSel.value = dir === 'TB' ? 'TD' : dir
    dirSel.addEventListener('change', () => editor.dispatch({ type: 'setDirection', direction: dirSel.value }))
    toolbarEl.appendChild(dirSel)
  }

  btn('Delete', 'Delete selection (Del)', () => editor.deleteEntities(editor.selection))
  const undoBtn = btn('Undo', 'Undo (Cmd/Ctrl+Z)', () => editor.undo())
  const redoBtn = btn('Redo', 'Redo (Cmd/Ctrl+Shift+Z)', () => editor.redo())
  undoBtn.id = 'btn-undo'
  redoBtn.id = 'btn-redo'

  updateToolButtons()
}

function setTool(tool: Tool) {
  view.setTool(tool)
  updateToolButtons()
}

function updateToolButtons() {
  toolbarEl.querySelectorAll<HTMLButtonElement>('button.tool').forEach((b) => {
    b.classList.toggle('active', b.dataset.tool === view.currentTool)
  })
  const undoBtn = toolbarEl.querySelector<HTMLButtonElement>('#btn-undo')
  const redoBtn = toolbarEl.querySelector<HTMLButtonElement>('#btn-redo')
  if (undoBtn) undoBtn.disabled = !editor.canUndo
  if (redoBtn) redoBtn.disabled = !editor.canRedo
}

// ---------- inspector ----------

function buildInspector() {
  inspectorEl.innerHTML = ''
  const sel = editor.selection
  const graph = editor.result.flowchart
  if (!graph || sel.length === 0) {
    inspectorEl.classList.remove('visible')
    return
  }
  inspectorEl.classList.add('visible')

  const info = document.createElement('span')
  info.className = 'ins-label'
  inspectorEl.appendChild(info)

  if (sel.length > 1) {
    info.textContent = `${sel.length} selected`
    return
  }
  const id = sel[0]

  if (id.startsWith('node:')) {
    const node = graph.nodeById.get(id.slice(5))
    if (!node) return
    info.textContent = `node ${node.id}`

    const shapeSel = document.createElement('select')
    shapeSel.innerHTML = SHAPES.map((s) => `<option value="${s.id}">${s.label}</option>`).join('')
    shapeSel.value = SHAPES.some((s) => s.id === node.shape) ? node.shape : 'rect'
    shapeSel.addEventListener('change', () =>
      editor.dispatch({ type: 'setNodeShape', id: node.id, shape: shapeSel.value as ShapeId }),
    )
    inspectorEl.appendChild(shapeSel)

    const rename = document.createElement('button')
    rename.textContent = 'Rename'
    rename.addEventListener('click', () => view.editEntityLabel(id))
    inspectorEl.appendChild(rename)
  } else if (id.startsWith('edge:')) {
    const edge = graph.edges.find((e) => e.entityId === id)
    if (!edge) return
    info.textContent = `edge ${edge.source} → ${edge.target}`

    const lineSel = document.createElement('select')
    lineSel.innerHTML = ['solid', 'dotted', 'thick']
      .map((l) => `<option value="${l}">${l}</option>`)
      .join('')
    lineSel.value = edge.seg.line === 'invisible' ? 'solid' : edge.seg.line
    lineSel.addEventListener('change', () =>
      editor.dispatch({ type: 'setEdgeStyle', edgeId: id, line: lineSel.value as EdgeLine }),
    )
    inspectorEl.appendChild(lineSel)

    const arrowSel = document.createElement('select')
    arrowSel.innerHTML = [
      ['arrow', 'arrow →'],
      ['open', 'open —'],
      ['circle', 'circle ●'],
      ['cross', 'cross ✕'],
    ]
      .map(([v, l]) => `<option value="${v}">${l}</option>`)
      .join('')
    arrowSel.value = edge.seg.arrowEnd
    arrowSel.addEventListener('change', () =>
      editor.dispatch({ type: 'setEdgeStyle', edgeId: id, arrowEnd: arrowSel.value as EdgeArrow }),
    )
    inspectorEl.appendChild(arrowSel)

    const label = document.createElement('button')
    label.textContent = 'Edit label'
    label.addEventListener('click', () => view.editEntityLabel(id))
    inspectorEl.appendChild(label)
  }

  const del = document.createElement('button')
  del.textContent = 'Delete'
  del.className = 'danger'
  del.addEventListener('click', () => editor.deleteEntities(sel))
  inspectorEl.appendChild(del)
}

// ---------- status ----------

function updateStatus() {
  const t = editor.result.typeInfo
  const cap = t?.capability === 'edit' ? 'WYSIWYG editing' : 'render + code'
  typebadgeEl.innerHTML = t
    ? `<a href="${t.docsUrl}" target="_blank">${t.name}</a> <em class="${t.capability}">${cap}</em>`
    : '<em>unknown type</em>'
  const diags = editor.diagnostics
  if (view.renderError) {
    statusbarEl.innerHTML = `<span class="err">✕ ${escapeHtml(view.renderError)}</span>`
  } else if (diags.length) {
    statusbarEl.innerHTML = `<span class="err">✕ ${escapeHtml(diags[0].message)}</span>`
  } else {
    statusbarEl.innerHTML = `<span class="ok">✓ renders</span>`
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

// ---------- sidebar ----------

function buildSidebar(activeIndex: number) {
  sidebarEl.innerHTML = `<div class="side-title">Diagram types <span>${DIAGRAM_TYPES.length} supported</span></div>`
  SAMPLES.forEach((sample, i) => {
    const t = DIAGRAM_TYPES.find((d) => d.id === sample.typeId)
    const b = document.createElement('button')
    b.className = 'side-item' + (i === activeIndex ? ' active' : '')
    b.innerHTML = `<i class="dot ${t?.capability ?? 'render'}"></i>${sample.title}`
    b.title = t?.capability === 'edit' ? 'Full WYSIWYG editing' : 'Rendered; code editing with live preview'
    b.addEventListener('click', () => loadSample(i))
    sidebarEl.appendChild(b)
  })
  const legend = document.createElement('div')
  legend.className = 'legend'
  legend.innerHTML = `<span><i class="dot edit"></i>WYSIWYG</span><span><i class="dot render"></i>render + code</span>`
  sidebarEl.appendChild(legend)
}

// ---------- wiring ----------

let currentSample = 0

function loadSample(index: number) {
  currentSample = index
  const sample = SAMPLES[index]

  view?.destroy()
  canvasEl.innerHTML = ''
  applyPalette(themeSel.value)

  editor = new MermaidWysiwygEditor({ code: sample.code })
  view = new MermaidCanvasView({
    editor,
    container: canvasEl,
    accentColor: accentInput.value,
    readOnly: readonlyChk.checked,
  })

  editor.on('change', () => {
    buildToolbar()
    buildInspector()
    view.validate()
    updateStatus()
  })

  editor.on('selectionChange', () => {
    buildInspector()
  })

  editor.on('diagnostics', updateStatus)
  view.on('render', () => updateStatus())
  view.on('toolChange', updateToolButtons)

  codePane?.destroy()
  const codeHost = $('#codepane')
  codeHost.innerHTML = ''
  codePane = new MermaidCodeMirror(codeHost, editor)

  buildSidebar(index)
  buildToolbar()
  buildInspector()
  view.validate()
  updateStatus()
}

themeSel.addEventListener('change', () => applyPalette(themeSel.value))
accentInput.addEventListener('input', () => {
  view.setAccentColor(accentInput.value)
  document.documentElement.style.setProperty('--accent', accentInput.value)
})
readonlyChk.addEventListener('change', () => {
  view.setReadOnly(readonlyChk.checked)
  buildToolbar()
})

loadSample(0)
