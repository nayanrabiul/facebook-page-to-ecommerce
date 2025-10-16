import { FacebookPost } from './facebook_page_reader';

export interface CategorizedPost extends FacebookPost {
  category_name: string;
  confidence_score: number;
  suggested_subcategories: string[];
  category_hierarchy: string[];
}

export function analyzeCategories(
  postsData: FacebookPost[],
  customCategories: string[] = [],
  language = 'bn'
): CategorizedPost[] {
  console.log('Analyzing categories for posts...');

  const categorizedPosts = postsData.map((post) => {
    let category = 'Uncategorized';
    const text = post.text_content.toLowerCase();

    if (text.includes('fashion') || text.includes('apparel') || text.includes('পোশাক')) {
      category = 'Fashion & Apparel';
    } else if (text.includes('electronics') || text.includes('ইলেকট্রনিক্স')) {
      category = 'Electronics';
    } else if (text.includes('cosmetics') || text.includes('beauty') || text.includes('প্রসাধনী')) {
      category = 'Cosmetics & Beauty';
    } else if (text.includes('home') || text.includes('living') || text.includes('ঘর সাজানো')) {
      category = 'Home & Living';
    } else if (text.includes('food') || text.includes('beverages') || text.includes('খাদ্য পণ্য')) {
      category = 'Food & Beverages';
    } else if (text.includes('accessories') || text.includes('এক্সেসরিজ')) {
      category = 'Accessories';
    }

    return {
      ...post,
      category_name: category,
      confidence_score: 0.9, // Mock confidence score
      suggested_subcategories: [],
      category_hierarchy: [],
    };
  });

  return categorizedPosts;
}