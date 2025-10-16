# Client Agent

## Purpose
- Deliver the storefront UI that surfaces products generated from Facebook page content.
- Consume the REST feed exposed by internal services (expected at `http://localhost:3001/products`) and render cards for each product.
- Provide an integration point for Astro/React components that can evolve into a richer shopping experience.

## Key Entry Points
- `apps/client/src/pages/index.astro` – wraps the layout and mounts the React-powered product listing.
- `apps/client/src/components/ProductList.tsx` – fetches the product feed, normalises it into cards, and coordinates UI components from `src/components/ui`.
- `apps/client/astro.config.mjs` – configures Astro integrations (React, Tailwind) and determines build/dev behaviour.

## Data & Dependencies
- Expects a JSON array of products with `id`, `name`, `price`, and `category` fields from the API service.
- Relies on the shared design system primitives under `src/components/ui`.
- TailwindCSS v4 pipeline is enabled via Vite; Astro handles asset bundling.

## Operating Notes
- Run locally with `pnpm --filter web dev` (falls back to `astro dev`) and ensure the product API service is reachable.
- Adjust the fetch endpoint in `ProductList.tsx` if the products service is relocated or parameterised.
- Add new UI features by composing additional React islands or Astro pages; keep data access routed through a single fetch utility to simplify future SSR/support for authentication.
