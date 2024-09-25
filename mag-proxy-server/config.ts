import "jsr:@std/dotenv/load";

export const API_KEY = Deno.env.get("JINA_API_KEY") 
export const API_URL = Deno.env.get("JINA_API_URL")
export const CACHE_KEY = new URL(API_URL);
export const CACHE_NAME = "fangoria-articles-cache";
export const CACHE_TTL = 600000; // 10분 (밀리초 단위)
export const PORT = Deno.env.get("PORT") || "3031";
