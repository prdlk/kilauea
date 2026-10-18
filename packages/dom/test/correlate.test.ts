// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { PeleWysiwygEditor } from '@kilauea/core'
import { PeleCanvasView } from '../src'
import { SAMPLES } from '../../../apps/js-playground/src/samples'

// jsdom has no CSS.escape (browsers do)
if (typeof (globalThis as { CSS?: unknown }).CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape(s: string): string } }).CSS = {
    escape: (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`),
  }
}
// jsdom's canvas has no 2d context; pele falls back to its width table
HTMLCanvasElement.prototype.getContext = () => null

function mount(code: string) {
  const editor = new PeleWysiwygEditor({ code })
  const container = document.createElement('div')
  document.body.appendChild(container)
  const view = new PeleCanvasView({ editor, container, debounceMs: 0 })
  return { editor, container, view }
}

function tagged(container: HTMLElement): Set<string> {
  return new Set([...container.querySelectorAll('[data-mw-entity]')].map((el) => el.getAttribute('data-mw-entity')!))
}

/**
 * Every entity the engine knows about must be reachable on the canvas for the
 * editable sample of its type: this is the renderer seam, exercised against
 * the real pele output.
 */
describe('every graph entity correlates to a pele element', () => {
  /**
   * Source lines the generic line-item projection lists but that have no
   * element of their own on the canvas: branch switches, repeated sankey
   * sources (one node per name), layout-only block statements.
   */
  const codeOnly: Record<string, string[]> = {
    Gitgraph: ['item:4', 'item:8'],
    Sankey: ['item:3', 'item:4', 'item:5'],
    'Block diagram': ['item:3', 'item:9'],
  }
  for (const sample of SAMPLES) {
    it(sample.title, () => {
      const { editor, container, view } = mount(sample.code)
      expect(view.renderError).toBeNull()
      const r = editor.result
      const ids = tagged(container)
      const expected: string[] = []
      if (r.flowchart) {
        expected.push(...r.flowchart.nodes.map((n) => n.entityId), ...r.flowchart.edges.map((e) => e.entityId), ...r.flowchart.subgraphs.map((s) => s.entityId))
      }
      if (r.sequence) {
        expected.push(...r.sequence.participants.map((p) => p.entityId), ...r.sequence.events.map((e) => e.entityId))
      }
      if (r.state) expected.push(...r.state.states.map((s) => s.entityId), ...r.state.transitions.map((t) => t.entityId))
      if (r.classGraph) expected.push(...r.classGraph.classes.map((c) => c.entityId), ...r.classGraph.relations.map((x) => x.entityId))
      if (r.er) expected.push(...r.er.entities.map((e) => e.entityId), ...r.er.relations.map((x) => x.entityId))
      if (r.pie) expected.push(...r.pie.slices.map((s) => s.entityId))
      if (r.gantt) expected.push(...r.gantt.tasks.map((t) => t.entityId))
      if (r.lineItems) expected.push(...r.lineItems.items.filter((i) => i.matchText).map((i) => i.entityId))
      expect(expected.length).toBeGreaterThan(0)
      const missing = expected.filter((id) => !ids.has(id))
      expect(missing).toEqual(codeOnly[sample.title] ?? [])
      view.destroy()
    })
  }
})

describe('duplicate and nested structures', () => {
  it('matches duplicate A --> B edges in source order', () => {
    const { editor, container, view } = mount('flowchart LR\n  A -->|one| B\n  A -->|two| B\n  B --> C\n')
    const label = (id: string) =>
      container.querySelector(`g.pele-edge-label[data-mw-entity="${id}"] text`)?.textContent
    expect(label('edge:A->B#0')).toBe('one')
    expect(label('edge:A->B#1')).toBe('two')
    expect(editor.result.flowchart!.edges).toHaveLength(3)
    view.destroy()
  })

  it('skips state note connectors when numbering transitions', () => {
    const { container, view } = mount(
      'stateDiagram-v2\n  state Comp {\n    A --> B\n  }\n  note right of A : hi\n  Comp --> Done\n',
    )
    const ids = tagged(container)
    expect(ids.has('trans:A->B#0')).toBe(true)
    expect(ids.has('trans:Comp->Done#0')).toBe(true)
    expect(container.querySelector('g.pele-cluster[data-mw-entity="state:Comp"]')).not.toBeNull()
    view.destroy()
  })

  it('tags class member rows attributes-first and ER attribute rows by line', () => {
    const cls = mount('classDiagram\n  class A {\n    +go()\n    +int x\n  }\n')
    const rows = [...cls.container.querySelectorAll('[data-mw-member-line]')].map((el) => [el.textContent, el.getAttribute('data-mw-member-line')])
    expect(rows).toEqual([['+int x', '3'], ['+go()', '2']])
    cls.view.destroy()
    const er = mount('erDiagram\n  A {\n    string name PK "the name"\n    int id\n  }\n')
    const cells = [...er.container.querySelectorAll('[data-mw-attr-line="2"]')].map((el) => el.textContent)
    expect(cells).toEqual(['string', 'name', 'PK', 'the name'])
    er.view.destroy()
  })

  it('maps sequence messages and notes to their own statements', () => {
    const { editor, container, view } = mount(
      'sequenceDiagram\n  A->>B: m0\n  Note right of B: n1\n  loop every day\n    B-->>A: m3\n  end\n',
    )
    const events = editor.result.sequence!.events
    expect(events.map((e) => e.kind)).toEqual(['message', 'note', 'message'])
    const text = (id: string) => container.querySelector(`[data-mw-entity="${id}"] text`)?.textContent
    expect(text(events[0].entityId)).toBe('m0')
    expect(text(events[1].entityId)).toBe('n1')
    expect(text(events[2].entityId)).toBe('m3')
    expect(container.querySelectorAll('[data-mw-entity="participant:A"]')).toHaveLength(2)
    view.destroy()
  })

  it('publishes a renderer diagnostic spanning the failing line on a syntax error', () => {
    const { editor, view } = mount('sequenceDiagram\n  A->>B: hi\n  B->>\n  A->>B: x\n')
    expect(view.renderError).not.toBeNull()
    const diag = editor.diagnostics[0]
    expect(diag.source).toBe('renderer')
    const line = editor.result.lines[2]
    expect(diag.span).toEqual({ start: line.start, end: line.end })
    view.destroy()
  })
})
