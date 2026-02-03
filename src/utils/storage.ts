import { SavedList, ShoppingHistory } from "@/types/shopping";

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

const LISTS_KEY = "saved_lists";

export const getSavedLists = (): SavedList[] => {
  try {
    const data = localStorage.getItem(LISTS_KEY);
    const parsed: SavedList[] = data ? JSON.parse(data) : [];

    // Ensure all IDs are strings (convert any non-string IDs)
    const normalized = parsed.map((list) => ({
      ...list,
      id: String(list.id ?? ""),
    }));

    return normalized;
  } catch (error) {
    console.error("Failed to load saved lists:", error);
    return [];
  }
};

export const saveList = (list: import("@/types/shopping").SavedList) => {
  try {
    const existing = getSavedLists();
    const updated = [list, ...existing];
    localStorage.setItem(LISTS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Failed to save list:", error);
    return false;
  }
};

export const deleteSavedList = (id: string) => {
  try {
    const existing = getSavedLists();
    const updated = existing.filter((list) => list.id !== id);
    localStorage.setItem(LISTS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Failed to delete saved list:", error);
    return false;
  }
};

export const updateSavedList = (updatedList: import("@/types/shopping").SavedList) => {
  try {
    const existing = getSavedLists();
    const updated = existing.map((list) =>
      list.id === updatedList.id ? updatedList : list
    );
    localStorage.setItem(LISTS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Failed to update saved list:", error);
    return false;
  }
};

export const getFrequentItems = (limit: number = 7): string[] => {
  try {
    const history = getShoppingHistory();
    const itemCounts: Record<string, number> = {};

    history.forEach(trip => {
      trip.items.forEach(item => {
        const name = item.text.trim();
        if (name) {
          itemCounts[name] = (itemCounts[name] || 0) + 1;
        }
      });
    });

    return Object.entries(itemCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([name]) => name);
  } catch (error) {
    console.error("Failed to get frequent items:", error);
    return [];
  }
};
