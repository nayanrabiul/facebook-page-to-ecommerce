import type { ProductRecord } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductListProps {
  products: ProductRecord[];
  isLoading?: boolean;
  emptyMessage?: string;
}

function formatPrice(product: ProductRecord): string {
  if (product.price == null) {
    return 'Contact for price';
  }

  try {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: product.currency ?? 'BDT',
      maximumFractionDigits: 0,
    }).format(product.price);
  } catch {
    const symbol = product.currency?.toUpperCase() === 'BDT' ? '৳' : product.currency ?? 'BDT';
    return `${symbol} ${product.price}`;
  }
}

export default function ProductList({
  products,
  isLoading = false,
  emptyMessage = 'No products available yet. Run a Facebook sync to generate the catalog.',
}: ProductListProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading products…</p>;
  }

  if (!products.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          {product.imageUrls?.[0] ? (
            <div className="relative h-52 w-full overflow-hidden bg-muted">
              <img
                src={product.imageUrls[0]}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex h-52 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
              Image unavailable
            </div>
          )}

          <CardHeader className="gap-2">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-lg leading-tight">{product.title}</CardTitle>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
                {product.availability.replace(/_/g, ' ')}
              </span>
            </div>
            <CardDescription className="text-base font-semibold text-primary">{formatPrice(product)}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {product.categoryName}
              </span>
              {product.tags.slice(0, 4).map((tag) => (
                <span key={`${product.id}-${tag}`} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Post: {new Date(product.publishedAt).toLocaleDateString()}</span>
              {product.sourcePostUrl && (
                <a
                  className="font-medium text-primary hover:underline"
                  href={product.sourcePostUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Facebook
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
