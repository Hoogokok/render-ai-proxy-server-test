import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { Article } from "./type.ts";
import logger from "./logger.ts";

export async function scrapeFangoriaArticles(): Promise<Article[]> {
  logger.info("Fangoria 기사 스크래핑 중...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto("https://www.fangoria.com/");
    await page.waitForSelector('.kb-query-item, #archive-container article', { timeout: 10000 });

    const articles = await page.evaluate(() => {
      const queryItems = document.querySelectorAll('.kb-query-item');
      const archiveItems = document.querySelectorAll('#archive-container article');
      
      const parseQueryItem = (el: Element) => {
        const titleEl = el.querySelector('.kt-adv-heading21076_d17004-3e');
        const linkEl = el.querySelector('.kt-adv-heading-link21076_d17004-3e');
        const imageEl = el.querySelector('.kb-image21076_27e6cc-d0 img');
        const authorEl = el.querySelector('.kt-adv-heading21076_568805-e6');

        return {
          title: titleEl?.textContent?.trim() || '',
          url: linkEl?.getAttribute('href') || '',
          imageUrl: imageEl?.getAttribute('src') || '',
          author: authorEl?.textContent?.trim() || '',
        };
      };

      const parseArchiveItem = (el: Element) => {
        const titleEl = el.querySelector('.entry-title');
        const linkEl = el.querySelector('.entry-title a');
        const imageEl = el.querySelector('.post-thumbnail img');
        const authorEl = el.querySelector('.entry-meta .author');

        return {
          title: titleEl?.textContent?.trim() || '',
          url: linkEl?.getAttribute('href') || '',
          imageUrl: imageEl?.getAttribute('src') || '',
          author: authorEl?.textContent?.trim() || '',
        };
      };

      const queryArticles = Array.from(queryItems).map(parseQueryItem);
      const archiveArticles = Array.from(archiveItems).map(parseArchiveItem);

      return [...queryArticles, ...archiveArticles];
    });

    return articles.filter(isValidArticle);
  } catch (error) {
    logger.error("스크래핑 중 오류 발생:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

function isValidArticle(article: Partial<Article>): article is Article {
  return !!article.title && !!article.url && !!article.imageUrl && !!article.author;
}
