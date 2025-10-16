# MCP Agent

## Purpose
- Orchestrate the Facebook page ➝ ecommerce product transformation pipeline.
- Expose a single `/transform` endpoint that drives the four-step workflow: ingest posts, categorise content, generate product artefacts, and persist results.
- Serve as the bridge between social scraping utilities and downstream storefront/DB consumers.

## Workflow Overview
1. `facebook_page_reader.getPosts(pageUrl)` fetches or mocks up to 100 posts for analysis.
2. `category_analyzer.analyzeCategories(posts)` tags each post (default language `bn`) with high-level merchandising categories.
3. `product_generator.generateProducts(categorizedPosts)` derives SKU-like objects, performs lightweight price parsing, and standardises fields.
4. `data_manager.saveData(products, metadata)` writes the transformed dataset to the shared `db` package for later consumption.

## Entrypoints & Files
- `apps/mcp/src/index.ts` – Express server bootstrapping on port `3002`, handles request validation and pipeline assembly.
- `apps/mcp/src/facebook_page_reader.ts` – facade for Facebook ingestion (currently mock data; ready for API integration).
- `apps/mcp/src/category_analyzer.ts` – heuristic categoriser supporting Bengali keywords.
- `apps/mcp/src/product_generator.ts` – price extraction and product shaping logic.
- `apps/mcp/src/data_manager.ts` – persistence adapter into the `db` package.

## Operating Notes
- Start locally with `pnpm --filter mcp start`; the command relies on `ts-node` for on-the-fly TypeScript execution.
- Ensure the `db` package is built/linked via pnpm workspaces so that `import { writeDb } from 'db'` resolves correctly.
- Extend the pipeline by plugging new processors between steps (e.g., enrich imagery) and updating `index.ts` to wire them in.
