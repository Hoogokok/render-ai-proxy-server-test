export class FetchError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    this.name = "FetchError";
  }
}

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CacheError";
  }
}
