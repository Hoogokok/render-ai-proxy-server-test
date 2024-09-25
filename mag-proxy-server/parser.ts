import { Article } from "./type.ts";

export function parseArticlesFromMarkdown(markdown: string): Article[] {
  const lines = markdown.split('\n');
  const articles: Article[] = [];
  let currentArticle: Partial<Article> = {};
  let isLatestSection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === "The Latest") {
      isLatestSection = true;
      continue;
    }

    if (trimmedLine === "End of content") {
      break;
    }

    if (isNewArticle(trimmedLine)) {
      if (isValidArticle(currentArticle)) {
        articles.push(currentArticle as Article);
      }
      currentArticle = parseImageAndUrl(trimmedLine);
    } else if (isTitle(trimmedLine)) {
      currentArticle = {
        ...currentArticle,
        ...parseTitle(trimmedLine, isLatestSection, currentArticle.url),
      };
    } else if (isAuthor(trimmedLine)) {
      currentArticle.author = parseAuthor(trimmedLine);
    }
  }

  if (isValidArticle(currentArticle)) {
    articles.push(currentArticle as Article);
  }

  return articles;
}

function isNewArticle(line: string): boolean {
  return line.startsWith('[![');
}

function parseImageAndUrl(line: string): Partial<Article> {
  const match = line.match(/\[!\[([^\]]+)\]\(([^\)]+)\)\]\(([^\)]+)\)/);
  return match ? { imageUrl: match[2], url: match[3] } : {};
}

function isTitle(line: string): boolean {
  return line.startsWith('[') && !line.startsWith('[![');
}

function parseTitle(line: string, isLatestSection: boolean, existingUrl: string | undefined): Partial<Article> {
  if (isLatestSection) {
    const titleMatch = line.match(/\[([^\]]+)\]\(([^\)]+)\)/);
    if (titleMatch) {
      return {
        title: titleMatch[1].replace(/[-]+$/, '').trim(),
        url: existingUrl || titleMatch[2],
      };
    }
  } else {
    return { title: line.replace(/^\[|\].*$/g, '').trim() };
  }
  return {};
}

function isAuthor(line: string): boolean {
  return line.startsWith('By[');
}

function parseAuthor(line: string): string | undefined {
  const match = line.match(/By\[([^\]]+)\]\(([^\)]+)\)/);
  return match ? match[1] : undefined;
}

function isValidArticle(article: Partial<Article>): article is Article {
  return !!article.title && !!article.url && !!article.imageUrl && !!article.author;
}