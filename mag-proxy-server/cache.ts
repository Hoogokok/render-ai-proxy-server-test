import { Article } from "./type.ts";
import { CACHE_NAME, CACHE_KEY, CACHE_TTL } from "./config.ts";

export async function getCachedArticles(): Promise<Article[] | null> {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(CACHE_KEY);
    if (cachedResponse) {
      return await cachedResponse.json();
    }
    return null;
  }
  
  export async function cacheArticles(articles: Article[]): Promise<void> {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(
      CACHE_KEY,
      new Response(JSON.stringify(articles), {
        headers: { 'Cache-Control': `max-age=${CACHE_TTL}` },
      })
    );
  }