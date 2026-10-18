/** Pele syntax highlighting for Monaco (Monarch tokens). */

/** the slice of the monaco namespace `registerPeleLanguage` needs */
export interface MonacoNamespaceLike {
  languages: {
    getLanguages(): Array<{ id: string }>
    register(language: { id: string }): void
    setMonarchTokensProvider(languageId: string, provider: unknown): unknown
  }
}

/** Monarch token rules for pele source; pass to `setMonarchTokensProvider` */
export const peleMonarchTokens = {
  defaultToken: '',
  tokenizer: {
    root: [
      [/%%.*$/, 'comment'],
      [/"[^"]*"/, 'string'],
      [
        /^\s*(flowchart|graph|sequenceDiagram|classDiagram-v2|classDiagram|stateDiagram-v2|stateDiagram|erDiagram|pie|gantt|journey|timeline|quadrantChart|requirementDiagram|gitGraph|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|mindmap|kanban|packet-beta|packet|sankey-beta|sankey|radar-beta|treemap-beta|treemap|xychart-beta|xychart|block-beta|block|architecture-beta|swimlane-beta|agentflow-beta|railroad-ebnf-beta|railroad-abnf-beta|railroad-peg-beta|railroad-beta|treeView-beta|cynefin-beta|wardley-beta|eventmodeling|usecase-beta|venn-beta|ishikawa-beta|ishikawa|info)\b/,
        'keyword',
      ],
      [
        /\b(participant|actor|boundary|control|entity|database|collections|queue|loop|alt|else|opt|par|critical|break|rect|end|subgraph|direction|title|section|class|state|note|autonumber|dateFormat|axisFormat)\b/,
        'keyword',
      ],
      [/<?[-=.]{2,}[>x)o]?|:::?/, 'operator'],
      [/\d+(\.\d+)?/, 'number'],
    ],
  },
}

/** Register the pele language with a monaco namespace (idempotent). */
export function registerPeleLanguage(monaco: MonacoNamespaceLike): void {
  if (monaco.languages.getLanguages().some((l) => l.id === 'pele')) return
  monaco.languages.register({ id: 'pele' })
  monaco.languages.setMonarchTokensProvider('pele', peleMonarchTokens)
}
