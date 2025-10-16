import { access, mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const dbPath = path.resolve(__dirname, '../db.json');

export interface StoreMetadata {
  pageUrl: string;
  displayName: string;
  description: string;
  lastSyncedAt: string;
  totalProducts: number;
  totalCategories: number;
}

export interface ProductRecord {
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

export interface CategoryRecord {
  id: string;
  name: string;
  productCount: number;
  keywords: string[];
}

export interface DatabaseSchema {
  store: StoreMetadata | null;
  products: ProductRecord[];
  categories: CategoryRecord[];
  lastSyncedAt: string | null;
}

const defaultDatabase: DatabaseSchema = {
  store: null,
  products: [],
  categories: [],
  lastSyncedAt: null,
};

async function ensureDbFile(): Promise<void> {
  try {
    await access(dbPath);
  } catch {
    await mkdir(path.dirname(dbPath), { recursive: true });
    await writeFile(dbPath, JSON.stringify(defaultDatabase, null, 2), 'utf-8');
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  await ensureDbFile();
  const raw = await readFile(dbPath, 'utf-8');
  const parsed = JSON.parse(raw);
  return {
    ...defaultDatabase,
    ...parsed,
    products: parsed?.products ?? [],
    categories: parsed?.categories ?? [],
    store: parsed?.store ?? null,
    lastSyncedAt: parsed?.lastSyncedAt ?? null,
  };
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  await ensureDbFile();
  const payload: DatabaseSchema = {
    ...defaultDatabase,
    ...data,
    products: data.products ?? [],
    categories: data.categories ?? [],
    store: data.store ?? null,
    lastSyncedAt: data.lastSyncedAt ?? new Date().toISOString(),
  };

  await writeFile(dbPath, JSON.stringify(payload, null, 2), 'utf-8');
}

export async function updateDb(
  updater: (current: DatabaseSchema) => DatabaseSchema | Promise<DatabaseSchema>
): Promise<DatabaseSchema> {
  const current = await readDb();
  const next = await updater(current);
  await writeDb(next);
  return next;
}
