import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application, Context, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { cacheArticles, getCachedArticles } from "./cache.ts";
import { PORT } from "./config.ts";
import { createRateLimitMiddleware } from "./middleware.ts";
import { scrapeFangoriaArticles } from "./scraper.ts";
import { Article } from "./type.ts";
const app = new Application();
const router = new Router();

async function fetchFantoriaArticles(): Promise<Article[]> {
  console.log("Fangoria 기사 가져오는 중...");

  try {
    const articles = await scrapeFangoriaArticles();
    console.log(`${articles.length}개의 기사 파싱 완료`);
    return articles;
  } catch (error) {
    console.error('Fangoria 기사 가져오기 오류:', error);
    throw error;
  }
}


async function handleGetArticles(ctx: Context): Promise<void> {
  const forceRefresh = ctx.request.url.searchParams.get('refresh') === 'true';
  
  try {
    let articles: Article[];
    if (!forceRefresh) {
      const cachedArticles = await getCachedArticles();
      if (cachedArticles) {
        console.log("Serving cached articles");
        ctx.response.body = cachedArticles;
        return;
      }
    }
    
    console.log("Fetching fresh articles");
    articles = await fetchFantoriaArticles();
    await cacheArticles(articles);
    ctx.response.body = articles;
  } catch (error) {
    console.error('Error in handleGetArticles:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to fetch articles', details: error.message };
  }
}


router.get('/api/fangoria-articles', handleGetArticles);

app.use(oakCors());
app.use(createRateLimitMiddleware(100, 15 * 60 * 1000));
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Proxy server running on port ${PORT}`);
await app.listen({ port: Number(PORT) });
