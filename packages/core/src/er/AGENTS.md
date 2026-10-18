# er

**Parent context:** `../AGENTS.md`
**Generated:** 2026-10-17 · **Updated:** 2026-10-17

## Purpose
Structural editing for `erDiagram`: entities with attribute blocks and crow's-foot relations (cardinality glyphs, identifying vs non-identifying). Ops are routed here when `op.type` starts with `er.`.

## Key Files
| File | Description |
|------|-------------|
| `parse.ts` | `parseErStatement(line, inBlock)` → `ErStmt` = `ErRelationStmt｜ErEntityDeclStmt｜ErAttributeStmt｜ErSimpleStmt`; glyph tables `ER_CARDS_LEFT` (`\|o`,`\|\|`,`}o`,`}\|`) and `ER_CARDS_RIGHT` (`o\|`,`\|\|`,`o{`,`\|{`) |
| `graph.ts` | `buildErGraph` → `ErGraph` (`entities`, `entityById`, `relations`, ...); `erEntitySpans`, `erEntityAt` |
| `ops.ts` | `compileErOp`, `ErOp`, `ErCardinality` (`zero-or-one｜exactly-one｜zero-or-more｜one-or-more`), `cardinalityFromGlyph` (falls back to `exactly-one`); `LEFT_GLYPHS`/`RIGHT_GLYPHS` map cardinality to glyph text |

## For AI Agents

### Working In This Directory
- Entity ids: `entity:<id>` and `erel:<src>-><tgt>#<n>`; the prefix `erel:` (not `rel:`) is distinct from class relations. Entity ids match `[\w-]+`.
- Ops: `er.addEntity`, `er.connect`, `er.renameEntity`, `er.setCardinality` (`side: 'left'｜'right'`), `er.setIdentifying`, `er.setRelationLabel`, `er.addAttribute`, `er.setAttributeText` (by `attrLine`), `er.deleteEntity`, `er.deleteRelation`.
- Left vs right glyph sets are asymmetric; always go through `cardinalityFromGlyph` and the glyph maps instead of string-flipping.

### Testing Requirements
`pnpm --filter @kilauea/core test`; `test/er.test.ts` (`er parsing`, `er ops`; the same file also holds the `pie` and `gantt` suites).

### Common Patterns
Same `bodyIndent`/`insertAfterLine`/`deleteLine`/`findRelation` local helpers as `class/ops.ts`.

## Dependencies

### Internal
`../types`.

### External
None.

## Manual Notes
