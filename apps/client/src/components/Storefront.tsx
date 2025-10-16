import React, { useEffect, useMemo, useState } from 'react';
import ProductList from '@/components/ProductList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CatalogSnapshot, CategoryRecord, StoreMetadata } from '@/lib/types';

const PRODUCTS_API_URL =
  (import.meta.env.PUBLIC_PRODUCTS_API as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:3001';

interface SyncState {
  status: 'idle' | 'running' | 'success' | 'error';
  message: string | null;
}

export default function Storefront() {
  const [catalog, setCatalog] = useState<CatalogSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [syncState, setSyncState] = useState<SyncState>({ status: 'idle', message: null });

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${PRODUCTS_API_URL}/catalog`);
      if (!response.ok) {
        throw new Error(`Catalog request failed (${response.status})`);
      }

      const data = (await response.json()) as CatalogSnapshot;
      setCatalog(data);
    } catch (err) {
      console.error('Failed to load catalog', err);
      setError('Unable to load catalog. Ensure the products API service is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog().catch((err) => console.error(err));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!catalog) {
      return [];
    }

    let products = catalog.products;
    if (selectedCategory !== 'all') {
      products = products.filter((product) => product.categoryId === selectedCategory);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      products = products.filter(
        (product) =>
          product.title.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    return products;
  }, [catalog, selectedCategory, search]);

  const handleSync: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const pageUrl = String(formData.get('pageUrl') ?? '').trim();
    const displayName = String(formData.get('displayName') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    if (!pageUrl) {
      setSyncState({ status: 'error', message: 'Please enter a Facebook page URL.' });
      return;
    }

    setSyncState({ status: 'running', message: 'Running MCP transformation…' });

    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_url: pageUrl,
          display_name: displayName || undefined,
          description: description || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? 'Unknown MCP error');
      }

      const payload = await response.json();
      setSyncState({ status: 'success', message: payload.message ?? 'Transformation completed.' });
      await loadCatalog();
      event.currentTarget.reset();
    } catch (err) {
      console.error('Transformation failed', err);
      setSyncState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to transform Facebook content.',
      });
    }
  };

  const store: StoreMetadata | null = catalog?.store ?? null;
  const categories: CategoryRecord[] = catalog?.categories ?? [];

  return (
    <section className="space-y-10">
      <header className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {store?.displayName ?? 'Facebook Storefront'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {store?.description ?? 'Sync a Facebook page to generate your ecommerce catalog.'}
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            onClick={() => loadCatalog()}
          >
            Refresh catalog
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Products"
            value={store?.totalProducts ?? 0}
            hint={catalog?.products.length ? 'Synced via MCP pipeline' : 'Awaiting first sync'}
          />
          <StatsCard
            title="Categories"
            value={store?.totalCategories ?? categories.length}
            hint={categories.length ? 'Detected automatically' : 'No categories yet'}
          />
          <StatsCard
            title="Last Sync"
            value={store?.lastSyncedAt ? new Date(store.lastSyncedAt).toLocaleString() : 'Never'}
            hint={store?.pageUrl ?? 'No page selected'}
          />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Sync Facebook Page</CardTitle>
          <CardDescription>
            Paste a public Facebook page URL to ingest the latest posts and regenerate your storefront.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSync}>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium" htmlFor="pageUrl">
                Facebook page URL
              </label>
              <input
                id="pageUrl"
                name="pageUrl"
                type="url"
                placeholder="https://www.facebook.com/your-page"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="displayName">
                Store name (optional)
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="My Facebook Shop"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="description">
                Store description (optional)
              </label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="Describe the page or campaign"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={syncState.status === 'running'}
              >
                {syncState.status === 'running' ? 'Syncing…' : 'Start sync'}
              </button>

              {syncState.message && (
                <span
                  className={`text-sm ${
                    syncState.status === 'error'
                      ? 'text-destructive'
                      : syncState.status === 'success'
                      ? 'text-emerald-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {syncState.message}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shadow-sm md:max-w-sm">
            <span className="text-sm text-muted-foreground">Search</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or hashtags"
              className="flex-1 border-none bg-transparent text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="All"
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            />
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                label={`${category.name} (${category.productCount})`}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-6 text-sm text-destructive">
              {error}
              <button className="ml-4 underline" type="button" onClick={() => loadCatalog()}>
                Retry
              </button>
            </CardContent>
          </Card>
        ) : (
          <ProductList products={filteredProducts} isLoading={loading} />
        )}
      </section>
    </section>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  hint: string;
}

function StatsCard({ title, value, hint }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="py-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:bg-secondary'
      }`}
    >
      {label}
    </button>
  );
}
