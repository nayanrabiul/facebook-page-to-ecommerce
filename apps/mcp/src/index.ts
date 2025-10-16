import express, { Request, Response } from 'express';
import { getPosts } from './facebook_page_reader';
import { analyzeCategories } from './category_analyzer';
import { generateProducts } from './product_generator';
import { saveData, type PageMetadata } from './data_manager';

const app = express();
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3002;

app.use(express.json());

app.get('/healthz', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'mcp', port });
});

app.post('/transform', async (req: Request, res: Response) => {
  const { page_url: pageUrl, display_name: displayName, description, custom_categories: customCategories, language, post_limit: postLimit } =
    req.body ?? {};

  if (!pageUrl || typeof pageUrl !== 'string') {
    return res.status(400).json({ error: 'page_url is required' });
  }

  try {
    // 1. Fetch posts
    const posts = await getPosts(pageUrl, { postLimit: Number.isInteger(postLimit) ? postLimit : 100 });

    // 2. Analyze categories
    const categorizedPosts = analyzeCategories(posts, Array.isArray(customCategories) ? customCategories : [], language);

    // 3. Generate products
    const products = generateProducts(categorizedPosts);

    // 4. Persist data
    const pageMetadata: PageMetadata = {
      pageUrl,
      displayName,
      description,
    };

    const dataset = await saveData(products, pageMetadata);

    res.json({
      success: true,
      message: `Transformation complete for ${dataset.store?.displayName ?? 'store'}`,
      productCount: dataset.products.length,
      categoryCount: dataset.categories.length,
      lastSyncedAt: dataset.lastSyncedAt,
      store: dataset.store,
    });
  } catch (error) {
    console.error('MCP transformation pipeline failed', error);
    res.status(500).json({
      error: 'Failed to complete transformation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(port, () => {
  console.log(`MCP server listening at http://localhost:${port}`);
});
