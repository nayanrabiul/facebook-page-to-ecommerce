# Products API Agent

## Purpose
- Serve the transformed catalog data stored in the shared `db` package over a REST interface.
- Act as the bridge between the MCP pipeline and the Astro client by exposing `/products`, `/categories`, `/store`, and `/catalog`.
- Provide CORS-friendly endpoints so the frontend can function during local development.

## Key Endpoints
- `GET /healthz` – Service health probe.
- `GET /catalog` – Entire dataset payload (store, categories, products).
- `GET /products` – Filterable product feed (`?categoryId=...&search=...&limit=...`).
- `GET /products/:id` – Single product lookup by catalog id.
- `GET /categories` – Category summary including counts/keywords.
- `GET /store` – Store metadata derived from the Facebook page.

## Commands
- `pnpm --filter products-api dev` – Start the watcher with live-reload (uses `ts-node-dev`).
- `pnpm --filter products-api build` – Emit production build to `dist/`.
- `pnpm --filter products-api start` – Run the compiled JavaScript server.

## Notes
- Set `CORS_ORIGIN` (comma-separated) to restrict browser access; defaults to `*` for local development.
- The service relies on the `db` package; ensure `pnpm --filter db build` is run whenever schema changes occur.
