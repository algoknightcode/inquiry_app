import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppNotification = {
  id: string;
  text: string;
  timestamp: string;
  productId?: string;
  product?: any;
};

export const logProductInteraction = async (
  productName: string,
  productId: string,
  buyerId: string | null,
  sellerId: string | null,
  currentRole: "buyer" | "seller",
  product?: any
) => {
  let message = "";
  const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Rule 1: If seller session is active
  if (currentRole === "seller" && sellerId) {
    message = `Seller logged in at ${timeString}: Interacted with "${productName}"`;
  } 
  // Rule 2: If buyer session is active
  else if (currentRole === "buyer" && buyerId) {
    message = `Buyer visited product: "${productName}"`;
  } 
  // Rule 3: Guest session (no active buyer/seller login)
  else {
    message = `Guest visited product: "${productName}"`;
  }

  try {
    const existing = await AsyncStorage.getItem("app_notifications");
    const notifications: AppNotification[] = existing ? JSON.parse(existing) : [];
    
    const newNotification: AppNotification = {
      id: `${Date.now()}-${Math.random()}`,
      text: message,
      timestamp: timeString,
      productId,
      product
    };

    // Keep only the 30 latest notifications to prevent AsyncStorage memory bloat
    const updated = [newNotification, ...notifications].slice(0, 30);
    await AsyncStorage.setItem("app_notifications", JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to write notification", e);
  }
};

export const addNotification = async (message: string) => {
  const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  try {
    const existing = await AsyncStorage.getItem("app_notifications");
    const notifications: AppNotification[] = existing ? JSON.parse(existing) : [];
    
    const newNotification: AppNotification = {
      id: `${Date.now()}-${Math.random()}`,
      text: message,
      timestamp: timeString,
    };

    const updated = [newNotification, ...notifications].slice(0, 30);
    await AsyncStorage.setItem("app_notifications", JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to write notification", e);
  }
};