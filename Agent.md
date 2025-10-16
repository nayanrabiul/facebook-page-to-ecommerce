# Workspace Agent Guide

## Mission
- Convert Facebook page content into a browsable ecommerce storefront by chaining specialised agents across apps and packages.
- Maintain a clear contract between ingestion (`apps/mcp`), persistence (`packages/db`), and presentation (`apps/client`).

## System Map
- **`apps/mcp`** – Express/TypeScript service exposing `/transform` to run the four-stage ETL pipeline and populate the shared datastore.
- **`packages/db`** – File-backed persistence helpers that allow services to read/write the canonical `db.json` dataset.
- **`apps/client`** – Astro/React UI that pulls the product feed (currently expected from a products API on port `3001`) and renders storefront cards.

Data flow: `Facebook page URL` → MCP pipeline (posts → categorized posts → products) → `db.json` via shared package → products API (to be implemented) → Client UI.

## Operating Checklist
- Install dependencies once at the repo root: `pnpm install`.
- Run the MCP server (`pnpm --filter mcp start`) before triggering transformations.
- Expose the products API (can be a lightweight service reading from `packages/db`) at `http://localhost:3001/products` for the client app.
- Launch the storefront UI with `pnpm --filter web dev`; verify it consumes the populated dataset.

## Extensibility Hints
- Introduce background jobs or schedulers in MCP to automate periodic Facebook syncs.
- Harden `packages/db` by moving to an async or external database when concurrency becomes a concern.
- Expand the client with filtering, search, or SSR once the products API is finalised.
