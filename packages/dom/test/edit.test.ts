// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MermaidWysiwygEditor } from '@visimer/core'
import { MermaidCanvasView } from '../src'

// jsdom has no CSS.escape (browsers do)
if (typeof (globalThis as { CSS?: unknown }).CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape(s: string): string } }).CSS = {
    escape: (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`),
  }
}
// jsdom's canvas has no 2d context; pele falls back to its width table
HTMLCanvasElement.prototype.getContext = () => null

const CODE = 'flowchart TD\n  A[Start] --> B[End]\n'

function editorDiv(container: HTMLElement): HTMLElement {
  const div = container.querySelector<HTMLElement>('.mw-inplace-editor')
  if (!div) throw new Error('no label editor open')
  return div
}

function type(div: HTMLElement, text: string) {
  div.textContent = text
  div.dispatchEvent(new Event('input'))
}

function key(div: HTMLElement, key: string, init: KeyboardEventInit = {}) {
  div.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }))
}

/**
 * Label editing is an overlay over the rendered glyphs: the source follows
 * every keystroke (debounced) so code panes stay in sync, the canvas under
 * the overlay holds still until the session ends, and Escape undoes all of
 * it, live commits included.
 */
describe('label editing session', () => {
  let editor: MermaidWysiwygEditor
  let container: HTMLElement
  let view: MermaidCanvasView

  beforeEach(() => {
    vi.useFakeTimers()
    editor = new MermaidWysiwygEditor({ code: CODE })
    container = document.createElement('div')
    document.body.appendChild(container)
    view = new MermaidCanvasView({ editor, container, debounceMs: 0 })
  })

  afterEach(() => {
    view.destroy()
    container.remove()
    vi.useRealTimers()
  })

  it('opens over the rendered label, hiding the original', () => {
    view.editEntityLabel('node:A')
    const div = editorDiv(container)
    expect(div.textContent).toBe('Start')
    const label = container.querySelector<SVGElement>('[data-mw-entity="node:A"] text.pele-label')!
    expect(label.style.visibility).toBe('hidden')
  })

  it('live-commits while typing and holds the canvas until Enter', async () => {
    view.editEntityLabel('node:A')
    const svgBefore = container.querySelector('svg')
    const div = editorDiv(container)
    type(div, 'Begin')
    await vi.advanceTimersByTimeAsync(500)
    expect(editor.code).toContain('A[Begin]')
    // the change scheduled a render; it must not have swapped the SVG
    expect(container.querySelector('svg')).toBe(svgBefore)
    expect(container.contains(div)).toBe(true)

    type(div, 'Beginning')
    key(div, 'Enter')
    expect(editor.code).toContain('A[Beginning]')
    expect(container.querySelector('.mw-inplace-editor')).toBeNull()
    await vi.advanceTimersByTimeAsync(0)
    // the held render lands once the session is over
    expect(container.querySelector('svg')).not.toBe(svgBefore)
    expect(container.querySelector('[data-mw-entity="node:A"] text')?.textContent).toBe('Beginning')
  })

  it('Escape reverts live commits and restores the label', async () => {
    view.editEntityLabel('node:A')
    const div = editorDiv(container)
    type(div, 'Oops')
    await vi.advanceTimersByTimeAsync(500)
    expect(editor.code).toContain('A[Oops]')

    key(div, 'Escape')
    expect(editor.code).toBe(CODE)
    await vi.advanceTimersByTimeAsync(0)
    const label = container.querySelector<SVGElement>('[data-mw-entity="node:A"] text.pele-label')!
    expect(label.textContent).toBe('Start')
    expect(label.style.visibility).toBe('')
  })

  it('Shift+Enter becomes a <br/> in the source; Enter alone commits', () => {
    view.editEntityLabel('node:B')
    const div = editorDiv(container)
    key(div, 'Enter', { shiftKey: true })
    expect(container.contains(div)).toBe(true)
    type(div, 'Last\nstep')
    key(div, 'Enter')
    expect(editor.code).toContain('B["Last<br/>step"]')
  })

  it('a label with a line break edits as two lines and round-trips untouched', () => {
    editor.setCode('flowchart TD\n  A[One<br/>two] --> B[End]\n')
    view.render()
    view.editEntityLabel('node:A')
    const div = editorDiv(container)
    expect(div.textContent).toBe('One\ntwo')
    key(div, 'Enter')
    expect(editor.code).toContain('A[One<br/>two]')
  })

  it('an unlabeled edge edits at the arrow and the label lands in the source', () => {
    view.editEntityLabel('edge:A->B#0')
    const div = editorDiv(container)
    expect(div.textContent).toBe('')
    type(div, 'next')
    key(div, 'Enter')
    expect(editor.code).toContain('A[Start] -->|next| B[End]')
  })
})
