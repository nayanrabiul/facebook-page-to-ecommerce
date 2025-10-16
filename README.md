## Facebook Page ➝ Ecommerce Storefront

Transform a public Facebook page feed into a browsable ecommerce experience. The workspace is split into focused services that cooperate through a shared data package.

### Architecture
- **apps/mcp** – ETL service (`POST /transform`) that ingests Facebook posts, categorises merchandise, generates product records, and persists to the shared `packages/db`.
- **packages/db** – File-backed catalogue module (`db.json`) with typed helpers for reading/writing store metadata, categories, and products.
- **apps/products-api** – REST facade (port `3001`) exposing `/catalog`, `/products`, `/categories`, and `/store` endpoints for frontend consumption.
- **apps/client** – Astro + React storefront (port `4321`) with a sync form, category filters, and product grid fed by the products API and Astro server hooks.

Data flow:
`Facebook page URL → MCP /transform → packages/db/db.json → products API → Astro UI`.

### Prerequisites
- Node.js v18+
- pnpm v9 (or adapt the commands to npm/yarn manually)

### One-Time Setup
```bash
pnpm install
pnpm --filter db build      # emits dist/ + type declarations for the shared package
```

### Running the Stack (3 terminals)
1. **MCP pipeline (port 3002)**
   ```bash
   pnpm --filter mcp start
   ```
2. **Products API (port 3001)**
   ```bash
   pnpm --filter products-api dev
   ```
   Optional env: `CORS_ORIGIN=http://localhost:4321`

3. **Astro storefront (port 4321)**
   ```bash
   PUBLIC_PRODUCTS_API=http://localhost:3001 pnpm --filter web dev
   ```
   Optional env: `MCP_URL=http://localhost:3002` (defaults already align with local ports).

### Syncing a Facebook Page
1. Open http://localhost:4321 after all services are running.
2. Paste a Facebook page URL into the **Sync Facebook Page** form and submit.
3. The Astro backend calls `/api/transform`, which proxies to the MCP service. The MCP pipeline:
   - Generates up to 100 mock posts (ready for real API integration).
   - Classifies posts into merchandising categories.
   - Extracts pricing/hashtags and writes enriched products + store metadata to `db.json`.
4. The products API immediately serves the updated catalogue; the UI refreshes with the new cards.

#### Direct API calls
Trigger a sync without the UI:
```bash
curl -X POST http://localhost:3002/transform \
  -H "Content-Type: application/json" \
  -d '{"page_url":"https://www.facebook.com/example-page"}'
```
Fetch the generated catalogue:
```bash
curl http://localhost:3001/catalog | jq
```

### REST Surfaces
- **MCP**: `POST /transform` (`page_url`, optional `display_name`, `description`, `custom_categories`, `post_limit`, `language`)
- **Products API**:
  - `GET /catalog` – entire dataset payload
  - `GET /products?categoryId=&search=&limit=` – filtered feed
  - `GET /products/:id` – single product
  - `GET /categories` – category summary
  - `GET /store` – current store metadata

### Shared Data Schema (`packages/db`)
```ts
interface StoreMetadata {
  pageUrl: string;
  displayName: string;
  description: string;
  lastSyncedAt: string;
  totalProducts: number;
  totalCategories: number;
}

interface ProductRecord {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  categoryId: string;
  categoryName: string;
  imageUrls: string[];
  tags: string[];
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  sourcePostId: string;
  sourcePostUrl?: string;
  publishedAt: string;
}

interface CategoryRecord {
  id: string;
  name: string;
  productCount: number;
  keywords: string[];
}
```

### Development Notes
- Re-run `pnpm --filter db build` after editing `packages/db/src`.
- Update `PUBLIC_PRODUCTS_API` if the products service runs on a different host/port.
- The Facebook reader currently emits curated mock posts; replace `apps/mcp/src/facebook_page_reader.ts` with a real Graph API integration when credentials are available.
- New services should import types from `'db'` using `import type` to avoid bundling filesystem code into client builds.
