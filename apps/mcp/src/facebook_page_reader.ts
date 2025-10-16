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
  raw_metadata: any;
}

export function getPosts(pageUrl: string, postLimit = 100, includeMedia = true): FacebookPost[] {
  console.log(`Fetching ${postLimit} posts from ${pageUrl}`);

  // Mock data simulating a Facebook API response
  const mockPosts: FacebookPost[] = [
    {
      post_id: '12345',
      text_content: 'Check out our new product! #product #new',
      media_urls: ['http://example.com/image1.jpg'],
      timestamp: '2024-01-01T12:00:00Z',
      engagement_metrics: { likes: 100, comments: 20, shares: 5 },
      raw_metadata: {},
    },
    {
      post_id: '67890',
      text_content: 'Special offer on our best-selling item!',
      media_urls: ['http://example.com/image2.jpg'],
      timestamp: '2024-01-02T12:00:00Z',
      engagement_metrics: { likes: 200, comments: 40, shares: 10 },
      raw_metadata: {},
    },
  ];

  return mockPosts;
}