import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { MermaidWysiwygEditor } from '@kilauea/core'
import { MermaidCanvasView, type RenderOptions, type Tool, type ViewHooks } from '@kilauea/dom'

export { MermaidWysiwygEditor } from '@kilauea/core'
export { MermaidCanvasView, type RenderOptions } from '@kilauea/dom'

/**
 * Own an editor instance in React. Re-renders on document and selection
 * changes; dispatch ops or bind the code string to your own state.
 */
export function useMermaidEditor(initialCode: string) {
  const [editor] = useState(() => new MermaidWysiwygEditor({ code: initialCode }))
  const code = useSyncExternalStore(
    (cb) => editor.on('change', cb),
    () => editor.code,
  )
  const selection = useSyncExternalStore(
    (cb) => editor.on('selectionChange', cb),
    () => editor.selection,
  )
  return { editor, code, selection }
}

/**
 * Re-apply render options only when a key actually changed. Props are often
 * inline object literals, so identity alone would re-render the diagram on
 * every React render; callers passing `icons`/`measurer` functions should
 * memoize them.
 */
function useRenderOptions(viewRef: { current: MermaidCanvasView | null }, options: RenderOptions | undefined) {
  const applied = useRef(options)
  useEffect(() => {
    const prev = applied.current ?? {}
    const next = options ?? {}
    const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
    let changed = false
    for (const key of keys) {
      if ((prev as Record<string, unknown>)[key] !== (next as Record<string, unknown>)[key]) {
        changed = true
        break
      }
    }
    if (!changed) return
    applied.current = options
    viewRef.current?.setRenderOptions(next)
  }, [viewRef, options])
}

export interface MermaidWysiwygProps {
  /** mermaid source (controlled when `onCodeChange` is provided) */
  code: string
  onCodeChange?: (code: string) => void
  /**
   * Pele render options (fonts, limits, link policy, icons, …). Colors come
   * from `--pele-*` CSS variables on the host element or any ancestor.
   */
  renderOptions?: RenderOptions
  accentColor?: string
  readOnly?: boolean
  /** fit-to-canvas + drag-pan + pinch/ctrl-wheel zoom with corner controls */
  panZoom?: boolean
  tool?: Tool
  hooks?: ViewHooks
  onSelectionChange?: (entityIds: string[]) => void
  /** access the underlying editor and canvas view */
  onReady?: (editor: MermaidWysiwygEditor, view: MermaidCanvasView) => void
  className?: string
  style?: CSSProperties
}

/**
 * Drop-in visual Mermaid editor: full WYSIWYG canvas bound to a `code` prop.
 *
 * ```tsx
 * const [code, setCode] = useState('flowchart TD\n  A --> B')
 * <MermaidWysiwyg code={code} onCodeChange={setCode} />
 * ```
 */
export function MermaidWysiwyg(props: MermaidWysiwygProps) {
  const { code, onCodeChange, renderOptions, accentColor, readOnly, panZoom, tool, hooks, onSelectionChange, onReady, className, style } = props
  const hostRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<MermaidWysiwygEditor | null>(null)
  const viewRef = useRef<MermaidCanvasView | null>(null)
  const onCodeChangeRef = useRef(onCodeChange)
  const onSelectionChangeRef = useRef(onSelectionChange)
  onCodeChangeRef.current = onCodeChange
  onSelectionChangeRef.current = onSelectionChange

  useEffect(() => {
    if (!hostRef.current) return
    const editor = new MermaidWysiwygEditor({ code })
    const view = new MermaidCanvasView({
      editor,
      container: hostRef.current,
      renderOptions,
      accentColor,
      readOnly,
      panZoom,
      hooks,
    })
    editorRef.current = editor
    viewRef.current = view
    const offChange = editor.on('change', ({ code: next, origin }) => {
      if (origin !== 'external') onCodeChangeRef.current?.(next)
    })
    const offSelection = editor.on('selectionChange', ({ entityIds }) => {
      onSelectionChangeRef.current?.(entityIds)
    })
    onReady?.(editor, view)
    return () => {
      offChange()
      offSelection()
      view.destroy()
      editorRef.current = null
      viewRef.current = null
    }
    // the view is created once; prop updates are applied by the effects below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (editor && code !== editor.code) editor.setCode(code, 'external')
  }, [code])

  useEffect(() => {
    if (tool) viewRef.current?.setTool(tool)
  }, [tool])

  useEffect(() => {
    viewRef.current?.setReadOnly(readOnly ?? false)
  }, [readOnly])

  useEffect(() => {
    if (accentColor) viewRef.current?.setAccentColor(accentColor)
  }, [accentColor])

  useRenderOptions(viewRef, renderOptions)

  useEffect(() => {
    viewRef.current?.setHooks(hooks ?? {})
  }, [hooks])

  return <div ref={hostRef} className={className} style={{ minHeight: 240, ...style }} />
}

export interface MermaidCanvasProps {
  /** an editor you own (e.g. from `useMermaidEditor`) */
  editor: MermaidWysiwygEditor
  /** see `MermaidWysiwygProps.renderOptions` */
  renderOptions?: RenderOptions
  accentColor?: string
  readOnly?: boolean
  /** fit-to-canvas + drag-pan + pinch/ctrl-wheel zoom with corner controls */
  panZoom?: boolean
  hooks?: ViewHooks
  onReady?: (view: MermaidCanvasView) => void
  className?: string
  style?: CSSProperties
}

/** Canvas-only binding for an editor instance you manage yourself. */
export function MermaidCanvas(props: MermaidCanvasProps) {
  const { editor, renderOptions, accentColor, readOnly, panZoom, hooks, onReady, className, style } = props
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<MermaidCanvasView | null>(null)

  useEffect(() => {
    if (!hostRef.current) return
    const view = new MermaidCanvasView({
      editor,
      container: hostRef.current,
      renderOptions,
      accentColor,
      readOnly,
      panZoom,
      hooks,
    })
    onReady?.(view)
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  useEffect(() => {
    viewRef.current?.setHooks(hooks ?? {})
  }, [hooks])

  useEffect(() => {
    viewRef.current?.setReadOnly(readOnly ?? false)
  }, [readOnly])

  useEffect(() => {
    if (accentColor) viewRef.current?.setAccentColor(accentColor)
  }, [accentColor])

  useRenderOptions(viewRef, renderOptions)

  return <div ref={hostRef} className={className} style={{ minHeight: 240, ...style }} />
}
