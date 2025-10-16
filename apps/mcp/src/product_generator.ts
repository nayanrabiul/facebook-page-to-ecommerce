import { CategorizedPost } from './category_analyzer';

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number | null;
  currency: string;
  images: string[];
  category: string;
  subcategory: string | null;
  availability: string;
  tags: string[];
  source_post: string;
}

export function generateProducts(
  categorizedPosts: CategorizedPost[],
  extractPricing = true,
  imageProcessing = true
): Product[] {
  console.log('Generating products from categorized posts...');

  const products = categorizedPosts.map((post) => {
    let price: number | null = null;
    if (extractPricing) {
      const priceRegex = /(?:৳|BDT|Taka|taka|tk)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i;
      const match = post.text_content.match(priceRegex);
      if (match) {
        price = parseFloat(match[1].replace(',', ''));
      }
    }

    return {
      product_id: `prod_${post.post_id}`,
      name: `Product from post ${post.post_id}`,
      description: post.text_content,
      price: price,
      currency: 'BDT',
      images: post.media_urls,
      category: post.category_name,
      subcategory: null,
      availability: 'In-stock',
      tags: [],
      source_post: post.post_id,
    };
  });

  return products;
}