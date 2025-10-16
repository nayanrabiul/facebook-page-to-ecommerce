export interface FacebookPost {
  post_id: string;
  text_content: string;
  media_urls: string[];
  timestamp: string;
  engagement_metrics: {
    likes: number;
    comments: number;
    shares: number;
  };
  permalink_url: string;
  raw_metadata: Record<string, unknown>;
}

interface GetPostsOptions {
  postLimit?: number;
  includeMedia?: boolean;
}

const MOCK_POSTS: Omit<FacebookPost, 'post_id' | 'permalink_url' | 'timestamp'>[] = [
  {
    text_content:
      'Handcrafted Jamdani saree now available! Soft cotton weave perfect for festivals. ৳ 3,200 only. #fashion #saree #handloom',
    media_urls: ['https://picsum.photos/seed/jamdani/900/900'],
    engagement_metrics: { likes: 523, comments: 87, shares: 44 },
    raw_metadata: { language: 'bn', detected_category: 'fashion' },
  },
  {
    text_content:
      'Wireless Bluetooth earbuds with 36h backup and noise cancellation. Intro price BDT 1,500. Free home delivery in Dhaka 🎧 #electronics #gadget',
    media_urls: ['https://picsum.photos/seed/earbuds/900/900'],
    engagement_metrics: { likes: 812, comments: 134, shares: 62 },
    raw_metadata: { language: 'en', detected_category: 'electronics' },
  },
  {
    text_content:
      'Herbal glow face serum infused with vitamin C. ৳950 launch offer with cash on delivery. #beauty #skincare #cosmetics',
    media_urls: ['https://picsum.photos/seed/serum/900/900'],
    engagement_metrics: { likes: 411, comments: 59, shares: 22 },
    raw_metadata: { language: 'bn', detected_category: 'cosmetics' },
  },
  {
    text_content:
      'Premium acacia wood bedside lamp with woven shade. Warm glow for cozy nights. Price tk 1,800. #home #decor #lighting',
    media_urls: ['https://picsum.photos/seed/lamp/900/900'],
    engagement_metrics: { likes: 265, comments: 32, shares: 15 },
    raw_metadata: { language: 'en', detected_category: 'home_decor' },
  },
  {
    text_content:
      'Organic sunflower honey collected from Dinajpur. ৳600 per 500g jar. Limited stock! #food #honey #organic',
    media_urls: ['https://picsum.photos/seed/honey/900/900'],
    engagement_metrics: { likes: 689, comments: 142, shares: 88 },
    raw_metadata: { language: 'bn', detected_category: 'food' },
  },
  {
    text_content:
      'Genuine leather wallet with RFID protection. Introductory offer Tk 1,250. Gift packaging available. #accessories #leather',
    media_urls: ['https://picsum.photos/seed/wallet/900/900'],
    engagement_metrics: { likes: 377, comments: 51, shares: 19 },
    raw_metadata: { language: 'bn', detected_category: 'accessories' },
  },
];

export async function getPosts(
  pageUrl: string,
  { postLimit = 100, includeMedia = true }: GetPostsOptions = {}
): Promise<FacebookPost[]> {
  console.log(`Fetching up to ${postLimit} posts from ${pageUrl}`);

  const limit = Math.min(postLimit, 100);
  const now = Date.now();

  return Array.from({ length: limit }).map((_, index) => {
    const base = MOCK_POSTS[index % MOCK_POSTS.length];
    const postId = `${Math.abs(pageUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))}-${index + 1}`;

    return {
      post_id: postId,
      text_content: base.text_content,
      media_urls: includeMedia ? base.media_urls : [],
      timestamp: new Date(now - index * 3_600_000).toISOString(),
      engagement_metrics: base.engagement_metrics,
      permalink_url: `${pageUrl.replace(/\/$/, '')}/posts/${postId}`,
      raw_metadata: {
        ...base.raw_metadata,
        source_page: pageUrl,
        generated: true,
      },
    };
  });
}
