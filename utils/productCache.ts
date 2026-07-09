
const productCache: Record<string, any> = {};

export const setProductCache = (id: string, data: any) => {
  if (!id) return;
  productCache[id] = data;
};

export const getProductCache = (id: string) => {
  return productCache[id] || null;
};

/**
 * Retrieves the product data and instantly deletes it from memory 
 * to prevent multi-megabyte browsing sessions from lagging the app.
 */
export const consumeProductCache = (id: string): any | null => {
  const data = productCache[id];
  if (data) {
    delete productCache[id]; // Burn on read! Wipes the item out of RAM
    return data;
  }
  return null;
};