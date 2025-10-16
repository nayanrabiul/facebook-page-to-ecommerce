# MCP Agent

## Purpose
- Orchestrate the Facebook page ➝ ecommerce product transformation pipeline.
- Expose a single `/transform` endpoint that drives the four-step workflow: ingest posts, categorise content, generate product artefacts, and persist results.
- Serve as the bridge between social scraping utilities and downstream storefront/DB consumers.

## Workflow Overview
1. `facebook_page_reader.getPosts(pageUrl)` asynchronously fetches (or mocks) up to 100 posts for analysis.
2. `category_analyzer.analyzeCategories(posts)` tags each post (default language `bn`) with merchandising categories + keyword matches.
3. `product_generator.generateProducts(categorizedPosts)` derives SKU-like objects, parses prices/hashtags, and maps to the shared `ProductRecord` type.
4. `data_manager.saveData(products, metadata)` persists store metadata, categories, and products to `packages/db/db.json` and returns the new snapshot.

## Entrypoints & Files
- `apps/mcp/src/index.ts` – Express server bootstrapping on port `3002`, handles request validation and pipeline assembly.
- `apps/mcp/src/facebook_page_reader.ts` – facade for Facebook ingestion (currently seeded mock data for each run; swap with real API access when credentials are available).
- `apps/mcp/src/category_analyzer.ts` – heuristic categoriser supporting Bengali keywords and custom fallbacks.
- `apps/mcp/src/product_generator.ts` – price extraction and product shaping logic.
- `apps/mcp/src/data_manager.ts` – persistence adapter into the `db` package.

## Operating Notes
- Start locally with `pnpm --filter mcp start`; the command relies on `ts-node` for on-the-fly TypeScript execution.
- Build the `db` package (`pnpm --filter db build`) so the compiled `dist/` artefacts and type declarations are available at runtime.
- The Express server exposes `/transform` and `/healthz`; the transform response returns product/category counts alongside store metadata.
- Extend the pipeline by inserting new processors between steps (e.g., enrichment, translation) and wiring them in via `index.ts`.
