import { Article } from "./type.ts";
import { CACHE_NAME, CACHE_TTL, CACHE_KEY } from "./config.ts";

interface CachedData {
    articles: Article[];
    timestamp: number;
}

export async function getCachedArticles(): Promise<Article[] | null> {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(CACHE_KEY);
    if (!response) return null;

    const data: CachedData = await response.json();
    if (Date.now() - data.timestamp > CACHE_TTL) {
        await cache.delete(CACHE_KEY);
        return null;
    }

    return data.articles;
}

export async function cacheArticles(articles: Article[]): Promise<void> {
    const cache = await caches.open(CACHE_NAME);
    const data: CachedData = { articles, timestamp: Date.now() };
    await cache.put(CACHE_KEY, new Response(JSON.stringify(data)));
}