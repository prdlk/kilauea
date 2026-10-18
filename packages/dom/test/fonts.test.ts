// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MermaidWysiwygEditor } from '@visimer/core'
import { render } from 'pele'
import type * as Pele from 'pele'
import { MermaidCanvasView } from '../src'

vi.mock('pele', async (importOriginal) => {
  const actual = await importOriginal<typeof Pele>()
  return { ...actual, render: vi.fn(actual.render) }
})

// jsdom has no CSS.escape (browsers do)
if (typeof (globalThis as { CSS?: unknown }).CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape(s: string): string } }).CSS = {
    escape: (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`),
  }
}
// jsdom's canvas has no 2d context; pele falls back to its width table
HTMLCanvasElement.prototype.getContext = () => null

const CODE = 'flowchart TD\n  A[Start] --> B[End]\n'

/** the source of every pele render so far */
function renders(): string[] {
  return vi.mocked(render).mock.calls.map(([source]) => source as string)
}

/**
 * Stand-in for the slice of `FontFaceSet` the view reads. jsdom does not
 * implement one, and the real thing cannot be driven from a test.
 */
function installFontFaceSet(status: 'loading' | 'loaded') {
  const { promise: ready, resolve } = Promise.withResolvers<void>()
  const fonts = {
    status,
    ready,
    /** the webfont finished loading (or failed) and metrics are now final */
    settle() {
      fonts.status = 'loaded'
      resolve()
    },
  }
  Object.defineProperty(document, 'fonts', { value: fonts, configurable: true, writable: true })
  return fonts
}

/** let the font-settled continuation and any scheduled render run */
async function flush() {
  await vi.advanceTimersByTimeAsync(0)
}

/**
 * Pele measures label text against the fonts the document can use at the
 * moment it renders. A webfont that lands later changes every width, so the
 * view renders once more when the document's fonts settle — and only then.
 */
describe('re-measures when the document fonts land after the first render', () => {
  let editor: MermaidWysiwygEditor
  let container: HTMLElement
  let view: MermaidCanvasView | null

  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(render).mockClear()
    editor = new MermaidWysiwygEditor({ code: CODE })
    container = document.createElement('div')
    document.body.appendChild(container)
    view = null
  })

  afterEach(() => {
    view?.destroy()
    container.remove()
    vi.useRealTimers()
    // drop the stub so the next test starts from whatever the environment has
    delete (document as unknown as { fonts?: unknown }).fonts
  })

  it('re-renders once the fonts finish loading', async () => {
    const fonts = installFontFaceSet('loading')
    view = new MermaidCanvasView({ editor, container, debounceMs: 0 })
    expect(renders()).toEqual([CODE])

    fonts.settle()
    await flush()

    // same code, rendered again: the shapes from the first pass were sized
    // with the fallback font and have to be thrown away
    expect(renders()).toEqual([CODE, CODE])
  })

  it('does not keep re-rendering after the fonts have settled', async () => {
    const fonts = installFontFaceSet('loading')
    view = new MermaidCanvasView({ editor, container, debounceMs: 0 })
    fonts.settle()
    await flush()
    await flush()

    expect(renders().length).toBe(2)
  })

  it('arms only one re-measure when several renders land before the fonts do', async () => {
    const fonts = installFontFaceSet('loading')
    view = new MermaidCanvasView({ editor, container, debounceMs: 0 })

    // a second render while the fonts are still loading: new options, say
    view.setRenderOptions({ padding: 4 })
    expect(renders().length).toBe(2)

    fonts.settle()
    await flush()
    await flush()

    // one corrective render, not one per render that was waiting
    expect(renders().length).toBe(3)
  })

  it('does not re-render when the fonts were already available', async () => {
    installFontFaceSet('loaded')
    view = new MermaidCanvasView({ editor, container, debounceMs: 0 })
    await flush()

    expect(renders()).toEqual([CODE])
  })

  it('renders normally where the document exposes no font set', async () => {
    Object.defineProperty(document, 'fonts', { value: undefined, configurable: true, writable: true })
    view = new MermaidCanvasView({ editor, container, debounceMs: 0 })
    await flush()

    expect(renders()).toEqual([CODE])
  })

  it('does not re-render a destroyed view when the fonts land late', async () => {
    const fonts = installFontFaceSet('loading')
    view = new MermaidCanvasView({ editor, container, debounceMs: 0 })
    view.destroy()
    view = null

    fonts.settle()
    await flush()

    expect(renders()).toEqual([CODE])
  })
})
