# Client Agent

## Purpose
- Deliver the storefront UI that surfaces products generated from Facebook page content.
- Coordinate the sync workflow by calling the Astro API hook (`/api/transform`) which proxies to the MCP pipeline.
- Render the enriched catalogue from the dedicated products API and provide category/search UX.

## Key Entry Points
- `apps/client/src/pages/index.astro` – wraps the layout and mounts the `Storefront` React island.
- `apps/client/src/components/Storefront.tsx` – orchestrates catalogue fetching, sync form, filters, and error states.
- `apps/client/src/components/ProductList.tsx` – presentational component that renders `ProductRecord` cards.
- `apps/client/src/pages/api/transform.ts` – server-side handler that invokes the MCP service then returns the updated dataset.
- `apps/client/astro.config.mjs` – configures Astro integrations (React, Tailwind) and determines build/dev behaviour.

## Data & Dependencies
- Reads the full catalogue snapshot from `http://localhost:3001/catalog` (configurable via `PUBLIC_PRODUCTS_API`).
- Uses shared types from the `db` package via `import type` re-exports in `src/lib/types.ts`.
- TailwindCSS v4 pipeline is enabled via Vite; Astro handles asset bundling.

## Operating Notes
- Start with `pnpm --filter web dev` and ensure the MCP (3002) and products API (3001) services are running.
- Set `PUBLIC_PRODUCTS_API` (client) and `MCP_URL` (Astro API route) if the backend services live elsewhere.
- Extend the UI by composing additional React islands or Astro pages; keep data access routed through the products API/transform hook for consistency.
