# DB Agent

## Purpose
- Provide a lightweight persistence layer shared across applications in the workspace.
- Abstract JSON file access (`packages/db/db.json`) behind typed async helpers so callers avoid direct filesystem handling.

## Exposed API
- `readDb(): Promise<DatabaseSchema>` – lazily ensures the file exists, then returns the parsed catalogue snapshot.
- `writeDb(data: DatabaseSchema): Promise<void>` – persists the provided payload with pretty-printed JSON.
- `updateDb(updater): Promise<DatabaseSchema>` – utility to read, mutate, and write in one call.
- Exported TypeScript interfaces: `StoreMetadata`, `ProductRecord`, `CategoryRecord`, `DatabaseSchema`.

## Implementation Notes
- `src/index.ts` uses the Node 18 `fs/promises` API and auto-bootstrap the JSON file if it does not exist.
- The schema is normalised into store metadata, products, categories, and `lastSyncedAt`.
- `tsconfig.json` emits declarations so downstream packages can `import type` the shared interfaces.
- When bundling (`pnpm --filter db build`), the `files` field publishes `dist/` plus the live `db.json`.

## Extending
- Swap the underlying storage by replacing the helper implementations while keeping the exported interface stable.
- Add schema validation or migrate to an external database when concurrency requirements increase.
