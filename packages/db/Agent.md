# DB Agent

## Purpose
- Provide a lightweight persistence layer shared across applications in the workspace.
- Abstract JSON file access (`packages/db/db.json`) behind simple read/write helpers so callers avoid direct filesystem handling.

## Exposed API
- `readDb(): any` – synchronously loads and parses the JSON payload from `db.json`.
- `writeDb(data: any): void` – overwrites the JSON file with a pretty-printed payload.
- `db` – convenience export that returns the eagerly-read snapshot at module import time.

## Implementation Notes
- `src/index.ts` resolves the database path relative to the package root to work in compiled builds (`dist` folder).
- The current storage engine is synchronous and file-based; callers should be mindful of blocking behaviour and race conditions.
- When bundling to JavaScript (`pnpm --filter db build`), ensure the compiled output keeps `db.json` accessible alongside `dist`.

## Extending
- Swap the underlying storage by replacing the helper implementations while keeping the exported interface stable.
- Consider adding async wrappers or schema validation before exposing this package to multi-instance services.
