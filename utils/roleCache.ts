export let userRole: "buyer" | "seller" = "buyer"; // default
export let isSellerSignedIn = false;
export let globalSellerId: string | null = null;

export const setGlobalRole = (role: "buyer" | "seller") => {
  userRole = role;
};

export const setSellerSignedIn = (val: boolean) => {
  isSellerSignedIn = val;
};

export const setGlobalSellerId = (id: string | null) => {
  globalSellerId = id;
};

export let globalBuyerId: string | null = null;

export const setGlobalBuyerId = (id: string | null) => {
  globalBuyerId = id;
};