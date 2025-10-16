import express, { Request, Response } from 'express';
import { getPosts } from './facebook_page_reader';
import { analyzeCategories } from './category_analyzer';
import { generateProducts } from './product_generator';
import { saveData, PageMetadata } from './data_manager';

const app = express();
const port = 3002;

app.use(express.json());

app.post('/transform', (req: Request, res: Response) => {
  const { page_url } = req.body;

  if (!page_url) {
    return res.status(400).send({ error: 'page_url is required' });
  }

  // 1. Fetch posts
  const posts = getPosts(page_url);

  // 2. Analyze categories
  const categorizedPosts = analyzeCategories(posts);

  // 3. Generate products
  const products = generateProducts(categorizedPosts);

  // 4. Save data
  const pageMetadata: PageMetadata = { name: 'My Store', description: 'A store generated from a Facebook page' };
  saveData(products, pageMetadata);

  res.send({ success: true, message: 'Transformation complete!' });
});

app.listen(port, () => {
  console.log(`MCP server listening at http://localhost:${port}`);
});