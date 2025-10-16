import { writeDb, type CategoryRecord, type DatabaseSchema, type ProductRecord, type StoreMetadata } from 'db';

export interface PageMetadata {
  pageUrl: string;
  displayName?: string;
  description?: string;
  sourceHandle?: string;
}

function deriveStoreName({ pageUrl, displayName }: PageMetadata): string {
  if (displayName && displayName.trim()) {
    return displayName.trim();
  }

  try {
    const url = new URL(pageUrl);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment) {
      return lastSegment.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return url.hostname.replace(/^www\./, '').replace(/\.\w+$/, '').replace(/[-_]/g, ' ');
  } catch {
    return pageUrl.replace(/^https?:\/\//, '');
  }
}

function buildCategoryIndex(products: ProductRecord[]): CategoryRecord[] {
  const categoryMap = new Map<string, CategoryRecord>();

  for (const product of products) {
    const existing = categoryMap.get(product.categoryId);
    if (existing) {
      existing.productCount += 1;
      const newKeywords = product.tags.filter((tag) => !existing.keywords.includes(tag) && tag !== product.categoryId);
      existing.keywords.push(...newKeywords.slice(0, 3));
      continue;
    }

    categoryMap.set(product.categoryId, {
      id: product.categoryId,
      name: product.categoryName,
      productCount: 1,
      keywords: product.tags.filter((tag) => tag !== product.categoryId).slice(0, 5),
    });
  }

  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveData(productsData: ProductRecord[], pageMetadata: PageMetadata): Promise<DatabaseSchema> {
  console.log('Saving data to the database...');

  const categories = buildCategoryIndex(productsData);
  const syncedAt = new Date().toISOString();

  const storeInfo: StoreMetadata = {
    pageUrl: pageMetadata.pageUrl,
    displayName: deriveStoreName(pageMetadata),
    description:
      pageMetadata.description?.trim() ??
      `Automated catalog generated from ${pageMetadata.pageUrl}. ${categories.length} categories detected.`,
    lastSyncedAt: syncedAt,
    totalProducts: productsData.length,
    totalCategories: categories.length,
  };

  const payload: DatabaseSchema = {
    store: storeInfo,
    products: productsData,
    categories,
    lastSyncedAt: syncedAt,
  };

  await writeDb(payload);

  console.log('Data saved successfully.');
  return payload;
}
