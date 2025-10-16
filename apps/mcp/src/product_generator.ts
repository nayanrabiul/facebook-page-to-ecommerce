import type { ProductRecord } from 'db';
import { CategorizedPost } from './category_analyzer';

interface GenerateProductsOptions {
  extractPricing?: boolean;
  defaultCurrency?: string;
}

function extractPrice(text: string): { amount: number | null; currency: string } {
  const priceRegex = /(?:৳|bdt|taka|tk)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i;
  const normalised = text.replace(/,/g, '');
  const match = normalised.match(priceRegex);

  if (!match) {
    return { amount: null, currency: 'BDT' };
  }

  const amount = Number.parseFloat(match[1]);
  return {
    amount: Number.isNaN(amount) ? null : amount,
    currency: 'BDT',
  };
}

function extractTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return 'Untitled Product';
  }

  const firstLine = trimmed.split('\n').map((line) => line.trim()).find(Boolean);
  if (!firstLine) {
    return 'Untitled Product';
  }

  if (firstLine.length <= 80) {
    return firstLine;
  }

  return `${firstLine.slice(0, 77).trim()}…`;
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#([\p{L}\p{N}_-]+)/gu) ?? [];
  return matches.map((tag) => tag.replace('#', '').toLowerCase());
}

function determineAvailability(text: string): ProductRecord['availability'] {
  const lower = text.toLowerCase();
  if (lower.includes('pre-order') || lower.includes('pre order')) {
    return 'preorder';
  }

  if (lower.includes('stock out') || lower.includes('out of stock')) {
    return 'out_of_stock';
  }

  return 'in_stock';
}

export function generateProducts(
  categorizedPosts: CategorizedPost[],
  { extractPricing = true, defaultCurrency = 'BDT' }: GenerateProductsOptions = {}
): ProductRecord[] {
  console.log('Generating products from categorized posts...');

  return categorizedPosts.map((post) => {
    const { amount, currency } = extractPricing ? extractPrice(post.text_content) : { amount: null, currency: defaultCurrency };

    const tags = Array.from(
      new Set([
        ...extractHashtags(post.text_content),
        ...post.matchedKeywords.map((keyword) => keyword.replace(/\s+/g, '-')),
        post.categoryId,
      ])
    );

    return {
      id: `prod-${post.post_id}`,
      title: extractTitle(post.text_content),
      description: post.text_content.trim(),
      price: amount,
      currency: currency ?? defaultCurrency,
      categoryId: post.categoryId,
      categoryName: post.categoryName,
      imageUrls: post.media_urls,
      tags,
      availability: determineAvailability(post.text_content),
      sourcePostId: post.post_id,
      sourcePostUrl: post.permalink_url,
      publishedAt: post.timestamp,
    };
  });
}
