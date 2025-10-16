import { FacebookPost } from './facebook_page_reader';

export interface CategorizedPost extends FacebookPost {
  categoryId: string;
  categoryName: string;
  confidenceScore: number;
  suggestedSubcategories: string[];
  categoryHierarchy: string[];
  matchedKeywords: string[];
}

interface CategoryRule {
  id: string;
  name: string;
  keywords: string[];
  suggestedSubcategories: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    id: 'fashion-apparel',
    name: 'Fashion & Apparel',
    keywords: ['fashion', 'apparel', 'dress', 'saree', 'শাড়ি', 'পোশাক', 'cloth', 'panjabi', 'shirt', 'lehenga', 'shoe'],
    suggestedSubcategories: ['Women Fashion', 'Men Fashion', 'Traditional Wear'],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    keywords: ['electronics', 'gadget', 'earbuds', 'smartphone', 'laptop', 'ইলেকট্রনিক্স', 'charger', 'headphone'],
    suggestedSubcategories: ['Audio', 'Mobile Accessories', 'Smart Devices'],
  },
  {
    id: 'cosmetics-beauty',
    name: 'Cosmetics & Beauty',
    keywords: ['cosmetics', 'beauty', 'serum', 'skincare', 'makeup', 'প্রসাধনী', 'lotion', 'cream'],
    suggestedSubcategories: ['Skin Care', 'Hair Care', 'Makeup'],
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    keywords: ['home', 'living', 'decor', 'lamp', 'furniture', 'ঘর সাজানো', 'lighting', 'kitchen'],
    suggestedSubcategories: ['Lighting', 'Decor', 'Kitchen Essentials'],
  },
  {
    id: 'food-beverages',
    name: 'Food & Beverages',
    keywords: ['food', 'beverage', 'honey', 'snack', 'খাদ্য', 'organic', 'tea', 'coffee'],
    suggestedSubcategories: ['Gourmet', 'Snacks', 'Beverages'],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    keywords: ['accessories', 'wallet', 'bag', 'belt', 'এক্সেসরিজ', 'jewelry', 'watch'],
    suggestedSubcategories: ['Leather Goods', 'Jewellery', 'Lifestyle'],
  },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function determineCategory(
  post: FacebookPost,
  customCategories: string[]
): { rule: CategoryRule; matchedKeywords: string[] } {
  const text = `${post.text_content} ${(post.raw_metadata?.keywords as string[])?.join(' ') ?? ''}`
    .toLowerCase()
    .normalize('NFKD');

  let bestMatch: { rule: CategoryRule; matchedKeywords: string[] } | null = null;

  for (const rule of CATEGORY_RULES) {
    const matches = rule.keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
    if (matches.length === 0) {
      continue;
    }

    if (!bestMatch || matches.length > bestMatch.matchedKeywords.length) {
      bestMatch = { rule, matchedKeywords: matches };
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  if (customCategories.length > 0) {
    const fallbackName = customCategories[0];
    return {
      rule: {
        id: slugify(fallbackName) || 'custom-category',
        name: fallbackName,
        keywords: [],
        suggestedSubcategories: [],
      },
      matchedKeywords: [],
    };
  }

  return {
    rule: {
      id: 'general-merchandise',
      name: 'General Merchandise',
      keywords: [],
      suggestedSubcategories: [],
    },
    matchedKeywords: [],
  };
}

export function analyzeCategories(
  postsData: FacebookPost[],
  customCategories: string[] = [],
  language = 'bn'
): CategorizedPost[] {
  console.log(`Analyzing categories for ${postsData.length} posts (language: ${language})...`);

  return postsData.map((post) => {
    const { rule, matchedKeywords } = determineCategory(post, customCategories);

    const confidenceBase = matchedKeywords.length > 0 ? 0.6 : 0.3;
    const confidence = Math.min(0.95, confidenceBase + Math.min(matchedKeywords.length * 0.1, 0.3));

    return {
      ...post,
      categoryId: rule.id,
      categoryName: rule.name,
      confidenceScore: confidence,
      suggestedSubcategories: rule.suggestedSubcategories,
      categoryHierarchy: [rule.name],
      matchedKeywords,
    };
  });
}
