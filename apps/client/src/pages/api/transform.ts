import type { APIRoute } from 'astro';
import { readDb } from 'db';

interface TransformRequestBody {
  page_url?: string;
  pageUrl?: string;
  display_name?: string;
  displayName?: string;
  description?: string;
  custom_categories?: string[];
  customCategories?: string[];
  language?: string;
  post_limit?: number;
  postLimit?: number;
}

const MCP_URL = process.env.MCP_URL ?? 'http://localhost:3002';

export const POST: APIRoute = async ({ request }) => {
  let payload: TransformRequestBody;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const pageUrl = payload.page_url ?? payload.pageUrl;
  if (!pageUrl || typeof pageUrl !== 'string') {
    return new Response(JSON.stringify({ error: 'page_url is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const requestBody = {
    page_url: pageUrl,
    display_name: payload.display_name ?? payload.displayName,
    description: payload.description,
    custom_categories: payload.custom_categories ?? payload.customCategories ?? [],
    language: payload.language ?? 'bn',
    post_limit: payload.post_limit ?? payload.postLimit ?? 100,
  };

  try {
    const response = await fetch(`${MCP_URL}/transform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const details = await response.text();
      return new Response(
        JSON.stringify({
          error: 'MCP transform failed',
          details,
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const dataset = await readDb();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Transformation completed for ${dataset.store?.displayName ?? 'store'}`,
        store: dataset.store,
        categories: dataset.categories,
        products: dataset.products,
        lastSyncedAt: dataset.lastSyncedAt,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Unexpected server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
