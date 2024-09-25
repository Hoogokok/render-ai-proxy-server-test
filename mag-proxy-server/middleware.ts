import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { RequestData } from "./type.ts";

type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

export function createRateLimitMiddleware(limit: number, windowMs: number): Middleware {
  const ipRequests = new Map<string, RequestData>();

  return async (ctx: Context, next: () => Promise<void>) => {
    const ip = ctx.request.ip;
    const now = Date.now();
    const requestData = ipRequests.get(ip) || { count: 0, timestamp: now };

    if (now - requestData.timestamp > windowMs) {
      requestData.count = 1;
      requestData.timestamp = now;
    } else {
      requestData.count++;
    }

    ipRequests.set(ip, requestData);

    if (requestData.count > limit) {
      ctx.response.status = 429;
      ctx.response.body = 'Too many requests';
      return;
    }

    await next();
  };
}
