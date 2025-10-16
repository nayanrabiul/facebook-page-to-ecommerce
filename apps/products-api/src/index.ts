import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { readDb } from 'db';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '3001', 10);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : undefined;

app.use(
  cors({
    origin: allowedOrigins ?? true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/healthz', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'products-api', port });
});

app.get('/catalog', async (_req: Request, res: Response) => {
  try {
    const data = await readDb();
    res.json(data);
  } catch (error) {
    console.error('Failed to read catalog', error);
    res.status(500).json({ error: 'Unable to load catalog' });
  }
});

app.get('/store', async (_req: Request, res: Response) => {
  try {
    const data = await readDb();
    res.json(data.store);
  } catch (error) {
    console.error('Failed to read store info', error);
    res.status(500).json({ error: 'Unable to load store information' });
  }
});

app.get('/categories', async (_req: Request, res: Response) => {
  try {
    const data = await readDb();
    res.json(data.categories);
  } catch (error) {
    console.error('Failed to read categories', error);
    res.status(500).json({ error: 'Unable to load categories' });
  }
});

app.get('/products', async (req: Request, res: Response) => {
  try {
    const data = await readDb();
    const { categoryId, search, limit } = req.query;

    let products = data.products;

    if (typeof categoryId === 'string' && categoryId.trim()) {
      products = products.filter((product) => product.categoryId === categoryId.trim());
    }

    if (typeof search === 'string' && search.trim()) {
      const term = search.trim().toLowerCase();
      products = products.filter(
        (product) =>
          product.title.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    const resolvedLimit = Number.parseInt(String(limit ?? ''), 10);
    if (!Number.isNaN(resolvedLimit) && resolvedLimit > 0) {
      products = products.slice(0, resolvedLimit);
    }

    res.json(products);
  } catch (error) {
    console.error('Failed to read products', error);
    res.status(500).json({ error: 'Unable to load products' });
  }
});

app.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const data = await readDb();
    const product = data.products.find((item) => item.id === req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Failed to read product', error);
    res.status(500).json({ error: 'Unable to load product' });
  }
});

app.listen(port, () => {
  console.log(`Products API listening at http://localhost:${port}`);
});
