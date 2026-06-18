/**
 * A simple in-memory cache to pass product data between
 * the listing page and the detail page, avoiding URL param size limits.
 */
export const productCache: Record<string, any> = {};
