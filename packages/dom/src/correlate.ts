import type {
  ClassGraph,
  ErGraph,
  FlowGraph,
  GanttGraph,
  LineItemsGraph,
  PieGraph,
  SequenceGraph,
  StateGraph,
} from '@visimer/core'

/**
 * Entity id → rendered element maps for the node/edge-shaped diagram types.
 * Pele stamps `data-id` on every node, edge, edge label, cluster, slice and
 * task group, so correlation is a lookup rather than a guess; anything whose
 * id is missing from the SVG lands in `failed` and stays view-only.
 */
export interface Correlation {
  nodes: Map<string, SVGGElement>
  /** entity id → the visible line `<path>` of an edge-shaped entity */
  edges: Map<string, SVGElement>
  edgeLabels: Map<string, SVGGElement>
  /** entity ids that failed to correlate (degraded to view-only) */
  failed: string[]
}

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function attr(sel: string, value: string): string {
  return `${sel}[data-id="${CSS.escape(value)}"]`
}

/**
 * Widen an edge's click surface: a transparent 14px-stroke clone of the line
 * path, carrying the same `data-mw-entity`, inserted before the visible path
 * so arrow heads still win visually. `pointer-events: stroke` keeps the
 * interior inert. Idempotent per entity id.
 */
function addEdgeHitOverlay(path: SVGElement, entityId: string): void {
  const doc = path.ownerDocument
  const parent = path.parentNode as ParentNode | null
  if (!doc || !parent) return
  if (parent.querySelector(`[data-mw-hit-overlay="${CSS.escape(entityId)}"]`)) return
  const overlay = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
  overlay.setAttribute('d', path.getAttribute('d') ?? '')
  overlay.setAttribute('fill', 'none')
  overlay.setAttribute('stroke', 'transparent')
  overlay.setAttribute('stroke-width', '14')
  overlay.setAttribute('stroke-linecap', 'round')
  overlay.setAttribute('data-mw-entity', entityId)
  overlay.setAttribute('data-mw-hit-overlay', entityId)
  overlay.style.pointerEvents = 'stroke'
  overlay.style.cursor = 'pointer'
  parent.insertBefore(overlay, path)
}

/** The visible line of a pele edge group: its first non-marker `<path>`. */
function edgeLine(group: SVGGElement): SVGElement | null {
  for (const child of group.children) {
    if (child.tagName === 'path' && !child.classList.contains('pele-marker')) return child as SVGElement
  }
  return null
}

/** numeric suffix of a pele edge id (`L_A_B_3`, `edge7`, `id_A_B_2`) */
function idSuffix(el: Element): number {
  const m = /(\d+)$/.exec(el.getAttribute('data-id') ?? '')
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY
}

/**
 * Tag an edge-shaped entity: the group takes `data-mw-entity` (hover and
 * selection chrome cover the line and its markers), the line path gets the
 * hit overlay and is what `edges` stores, and the label group, if any, is
 * tagged too so clicking the label selects the edge.
 */
function claimEdge(
  out: Correlation,
  entityId: string,
  group: SVGGElement,
  label: SVGGElement | undefined,
): void {
  group.setAttribute('data-mw-entity', entityId)
  const line = edgeLine(group)
  if (line) {
    out.edges.set(entityId, line)
    addEdgeHitOverlay(line, entityId)
  } else {
    out.edges.set(entityId, group)
  }
  if (label) {
    label.setAttribute('data-mw-entity', entityId)
    out.edgeLabels.set(entityId, label)
  }
}

/**
 * Match edge entities to pele edge groups whose `data-id` matches a per-entity
 * regex. Several entities can share one id prefix (duplicate `A --> B`
 * edges); candidates are claimed in ascending id-suffix order, which follows
 * source order in pele's numbering.
 */
function correlateEdges<T extends { entityId: string }>(
  svg: SVGSVGElement,
  out: Correlation,
  entities: T[],
  pattern: (entity: T, index: number) => RegExp,
  groupFilter: (group: SVGGElement) => boolean = () => true,
): void {
  const groups = [...svg.querySelectorAll<SVGGElement>('g.pele-edges > g.pele-edge')]
    .filter(groupFilter)
    .sort((a, b) => idSuffix(a) - idSuffix(b))
  const labels = new Map<string, SVGGElement>()
  for (const label of svg.querySelectorAll<SVGGElement>('g.pele-edge-labels > g.pele-edge-label')) {
    const id = label.getAttribute('data-id')
    if (id && !labels.has(id)) labels.set(id, label)
  }
  const claimed = new Set<Element>()
  entities.forEach((entity, index) => {
    const re = pattern(entity, index)
    const group = groups.find((g) => !claimed.has(g) && re.test(g.getAttribute('data-id') ?? ''))
    if (!group) {
      out.failed.push(entity.entityId)
      return
    }
    claimed.add(group)
    claimEdge(out, entity.entityId, group, labels.get(group.getAttribute('data-id')!))
  })
}

function claimNode(out: Correlation, entityId: string, el: SVGGElement | null): void {
  if (!el) {
    out.failed.push(entityId)
    return
  }
  el.setAttribute('data-mw-entity', entityId)
  out.nodes.set(entityId, el)
}

function empty(): Correlation {
  return { nodes: new Map(), edges: new Map(), edgeLabels: new Map(), failed: [] }
}

/**
 * Flowchart: nodes `g.pele-node[data-id=<id>]`, subgraphs
 * `g.pele-cluster[data-id=<id>]`, edges `L_<src>_<tgt>_<n>`.
 */
export function correlateFlowchart(svg: SVGSVGElement, graph: FlowGraph): Correlation {
  const out = empty()
  for (const node of graph.nodes) {
    claimNode(out, node.entityId, svg.querySelector<SVGGElement>(attr('g.pele-node', node.id)))
  }
  for (const sg of graph.subgraphs) {
    claimNode(out, sg.entityId, svg.querySelector<SVGGElement>(attr('g.pele-cluster', sg.id)))
  }
  correlateEdges(svg, out, graph.edges, (e) => new RegExp(`^L_${esc(e.source)}_${esc(e.target)}_\\d+$`))
  return out
}

/**
 * State diagram: states `g.pele-node[data-id=<id>]`, composites
 * `g.pele-cluster[data-id=<id>]`, transitions `edge<n>` where `n` counts
 * every edge pele draws (note connectors included), so transitions are
 * matched by ascending `n` rather than by index. `[*]` pseudo-states stay
 * view-only.
 */
export function correlateState(svg: SVGSVGElement, graph: StateGraph): Correlation {
  const out = empty()
  for (const s of graph.states) {
    claimNode(
      out,
      s.entityId,
      svg.querySelector<SVGGElement>(attr('g.pele-node', s.id)) ??
        svg.querySelector<SVGGElement>(attr('g.pele-cluster', s.id)),
    )
  }
  correlateEdges(svg, out, graph.transitions, () => /^edge\d+$/, (g) => g.classList.contains('pele-transition'))
  return out
}

/**
 * Class diagram: classes `g.pele-node[data-id=<id>]`, relations
 * `id_<src>_<tgt>_<n>` (`n` is 1-based over relations), member rows
 * `text.pele-member` listed attributes first, then methods.
 */
export function correlateClass(svg: SVGSVGElement, graph: ClassGraph): Correlation {
  const out = empty()
  for (const cls of graph.classes) {
    const el = svg.querySelector<SVGGElement>(attr('g.pele-node', cls.id))
    claimNode(out, cls.entityId, el)
    if (!el) continue
    // tag member rows for double-click editing
    const rows = [...el.querySelectorAll<SVGElement>('text.pele-member')]
    const attrs = cls.members.filter((m) => !m.text.includes('('))
    const methods = cls.members.filter((m) => m.text.includes('('))
    ;[...attrs, ...methods].forEach((m, i) => {
      const row = rows[i]
      if (!row) return
      row.setAttribute('data-mw-member-class', cls.id)
      row.setAttribute('data-mw-member-line', String(m.lineIndex))
    })
  }
  correlateEdges(
    svg,
    out,
    graph.relations,
    (r) => new RegExp(`^id_${esc(r.source)}_${esc(r.target)}_\\d+$`),
    (g) => g.classList.contains('pele-relation'),
  )
  return out
}

/**
 * ER diagram: entities `g.pele-node[data-id=<id>]`, relations
 * `id_entity-<src>-<i>_entity-<tgt>-<j>_<n>`, attribute cells
 * `g.pele-er-attributes > text` grouped into rows by their `y`.
 */
export function correlateEr(svg: SVGSVGElement, graph: ErGraph): Correlation {
  const out = empty()
  for (const entity of graph.entities) {
    const el = svg.querySelector<SVGGElement>(attr('g.pele-node', entity.id))
    claimNode(out, entity.entityId, el)
    if (!el || !entity.attributes.length) continue
    const rows = new Map<string, SVGElement[]>()
    for (const cell of el.querySelectorAll<SVGElement>('g.pele-er-attributes > text')) {
      const y = cell.getAttribute('y') ?? ''
      let row = rows.get(y)
      if (!row) rows.set(y, (row = []))
      row.push(cell)
    }
    const ordered = [...rows.values()]
    entity.attributes.forEach((a, i) => {
      for (const cell of ordered[i] ?? []) {
        cell.setAttribute('data-mw-attr-entity', entity.id)
        cell.setAttribute('data-mw-attr-line', String(a.lineIndex))
      }
    })
  }
  correlateEdges(
    svg,
    out,
    graph.relations,
    (r) => new RegExp(`^id_entity-${esc(r.source)}-\\d+_entity-${esc(r.target)}-\\d+_\\d+$`),
  )
  return out
}

/**
 * Pie: slices `path.pele-slice[data-id=<label>]` and legend rows
 * `g.pele-legend-item[data-id=<label>]`. Pele collapses duplicate labels into
 * one slice; later duplicates stay view-only.
 */
export function correlatePie(svg: SVGSVGElement, graph: PieGraph): Correlation {
  const out = empty()
  const claimed = new Set<string>()
  for (const slice of graph.slices) {
    if (claimed.has(slice.label)) {
      out.failed.push(slice.entityId)
      continue
    }
    const path = svg.querySelector<SVGGElement>(attr('path.pele-slice', slice.label))
    const legend = svg.querySelector<SVGGElement>(attr('g.pele-legend-item', slice.label))
    if (!path && !legend) {
      out.failed.push(slice.entityId)
      continue
    }
    claimed.add(slice.label)
    for (const el of [path, legend]) el?.setAttribute('data-mw-entity', slice.entityId)
    out.nodes.set(slice.entityId, (legend ?? path)!)
  }
  return out
}

/**
 * Gantt: task bars `g.pele-task` render in source order; their `data-id` is
 * the task's own id or a generated `taskN`, so order is the key.
 */
export function correlateGantt(svg: SVGSVGElement, graph: GanttGraph): Correlation {
  const out = empty()
  const bars = [...svg.querySelectorAll<SVGGElement>('g.pele-task')]
  if (bars.length === graph.tasks.length) {
    graph.tasks.forEach((task, i) => claimNode(out, task.entityId, bars[i]))
  } else {
    // a task pele could not draw shifts every later bar: fall back to label text
    const claimed = new Set<Element>()
    for (const task of graph.tasks) {
      const bar = bars.find((b) => !claimed.has(b) && b.querySelector('text')?.textContent?.trim() === task.name)
      if (bar) claimed.add(bar)
      claimNode(out, task.entityId, bar ?? null)
    }
  }
  return out
}

/**
 * Generic correlation for line-item chart types: match each item's label text
 * against the SVG's `<text>` elements, then tag the smallest enclosing group
 * so the hit area covers the shape too. Pele wraps long labels into tspans
 * (or, for cards, several `<text>` rows) whose concatenation drops the spaces
 * at the breaks, so comparison ignores whitespace and `data-id` groups are
 * candidates after bare text. Items whose label can't be found stay
 * code-only.
 */
export function correlateLineItems(svg: SVGSVGElement, graph: LineItemsGraph): Correlation {
  const out = empty()
  const squash = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, '')
  const candidates = [...svg.querySelectorAll<SVGElement>('text'), ...svg.querySelectorAll<SVGElement>('g[data-id]')].map(
    (el) => ({ el, text: squash(el.textContent) }),
  )
  const claimed = new Set<Element>()

  for (const item of graph.items) {
    if (!item.matchText) {
      out.failed.push(item.entityId)
      continue
    }
    const target = squash(item.matchText)
    const el = (
      candidates.find((c) => !claimed.has(c.el) && c.text === target) ??
      candidates.find((c) => !claimed.has(c.el) && c.text.startsWith(target))
    )?.el
    if (!el) {
      out.failed.push(item.entityId)
      continue
    }
    // one visual per item: a matched text takes its `data-id` group with it
    // and vice versa, so a later item naming the same thing stays code-only
    claimed.add(el)
    const group = el.closest('g[data-id]')
    if (group) claimed.add(group)
    for (const text of el.querySelectorAll('text')) claimed.add(text)
    let anchor: Element = el
    const parent = el.tagName === 'text' ? el.closest('g') : null
    if (parent && parent !== svg && squash(parent.textContent).length <= target.length + 24) {
      anchor = parent
    }
    anchor.setAttribute('data-mw-entity', item.entityId)
    if (anchor !== el) el.setAttribute('data-mw-entity', item.entityId)
    out.nodes.set(item.entityId, anchor as SVGGElement)
  }

  return out
}

export interface SequenceCorrelation {
  /** participant entity id → every SVG element belonging to it (top + bottom boxes) */
  participants: Map<string, Element[]>
  /** participant entity id → lifeline path */
  lifelines: Map<string, SVGGraphicsElement>
  /** event entity id → primary element (message group / note group) */
  events: Map<string, Element>
  /** event entity id → its text element */
  eventTexts: Map<string, Element>
  failed: string[]
}

/**
 * Sequence diagram: actors `g.pele-actor[data-id=<id>]` (drawn twice, head
 * and footer), lifelines `path.pele-lifeline[data-id=<id>]`, messages
 * `g.pele-message[data-id=i<n>]` and notes `g.pele-note[data-id=i<n>]`
 * where `n` is the statement's position in the diagram body — monotonic in
 * source order, so messages and notes are each matched in ascending `n`.
 */
export function correlateSequence(svg: SVGSVGElement, graph: SequenceGraph): SequenceCorrelation {
  const participants = new Map<string, Element[]>()
  const lifelines = new Map<string, SVGGraphicsElement>()
  const events = new Map<string, Element>()
  const eventTexts = new Map<string, Element>()
  const failed: string[] = []

  for (const p of graph.participants) {
    const els = [...svg.querySelectorAll(attr('g.pele-actor', p.id))]
    if (els.length) {
      participants.set(p.entityId, els)
      for (const el of els) el.setAttribute('data-mw-entity', p.entityId)
    } else {
      failed.push(p.entityId)
    }
    const line = svg.querySelector<SVGGraphicsElement>(attr('path.pele-lifeline', p.id))
    if (line) lifelines.set(p.entityId, line)
  }

  const byIndex = (sel: string) =>
    [...svg.querySelectorAll<SVGGElement>(sel)].sort((a, b) => idSuffix(a) - idSuffix(b))
  const labels = new Map<string, SVGGElement>()
  for (const label of svg.querySelectorAll<SVGGElement>('g.pele-edge-labels > g.pele-edge-label')) {
    const id = label.getAttribute('data-id')
    if (id && !labels.has(id)) labels.set(id, label)
  }

  const messages = graph.events.filter((e) => e.kind === 'message')
  const messageEls = byIndex('g.pele-edges > g.pele-message')
  messages.forEach((ev, i) => {
    const group = messageEls[i]
    if (!group) {
      failed.push(ev.entityId)
      return
    }
    group.setAttribute('data-mw-entity', ev.entityId)
    events.set(ev.entityId, group)
    const line = edgeLine(group)
    if (line) addEdgeHitOverlay(line, ev.entityId)
    const label = labels.get(group.getAttribute('data-id') ?? '')
    if (label) {
      label.setAttribute('data-mw-entity', ev.entityId)
      const text = label.querySelector('text')
      if (text) eventTexts.set(ev.entityId, text)
    }
  })

  const notes = graph.events.filter((e) => e.kind === 'note')
  const noteEls = byIndex('g.pele-note[data-id]')
  notes.forEach((ev, i) => {
    const group = noteEls[i]
    if (!group) {
      failed.push(ev.entityId)
      return
    }
    group.setAttribute('data-mw-entity', ev.entityId)
    events.set(ev.entityId, group)
    const text = group.querySelector('text')
    if (text) eventTexts.set(ev.entityId, text)
  })

  return { participants, lifelines, events, eventTexts, failed }
}
