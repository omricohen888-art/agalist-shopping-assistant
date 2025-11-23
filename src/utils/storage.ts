import { ShoppingHistory } from "@/types/shopping";

const STORAGE_KEY = "shopping_history";

export const saveShoppingHistory = (history: ShoppingHistory) => {
  try {
    const existing = getShoppingHistory();
    const updated = [history, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Failed to save shopping history:", error);
    return false;
  }
};

export const getShoppingHistory = (): ShoppingHistory[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load shopping history:", error);
    return [];
  }
};

export const deleteShoppingHistory = (id: string) => {
  try {
    const existing = getShoppingHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Failed to delete shopping history:", error);
    return false;
  }
};

export const clearAllHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear history:", error);
    return false;
  }
};
