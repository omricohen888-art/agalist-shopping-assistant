import { useAuth } from "@/context/AuthContext";
import { SavedList, ShoppingHistory } from "@/types/shopping";
import {
  cloudGetSavedLists,
  cloudSaveList,
  cloudUpdateSavedList,
  cloudDeleteSavedList,
  cloudGetShoppingHistory,
  cloudSaveShoppingHistory,
  cloudDeleteShoppingHistory,
  cloudClearAllHistory,
} from "@/utils/cloudStorage";
import {
  getSavedLists as localGetSavedLists,
  saveList as localSaveList,
  updateSavedList as localUpdateSavedList,
  deleteSavedList as localDeleteSavedList,
  getShoppingHistory as localGetShoppingHistory,
  saveShoppingHistory as localSaveShoppingHistory,
  deleteShoppingHistory as localDeleteShoppingHistory,
  clearAllHistory as localClearAllHistory,
} from "@/utils/storage";

/**
 * Hook for cloud-synced storage operations
 * - Logged in users: syncs with Supabase
 * - Guest users: uses localStorage only
 */
export const useCloudSync = () => {
  const { user } = useAuth();
  const userId = user?.id;

  // ========== SAVED LISTS ==========

  const getSavedLists = async (): Promise<SavedList[]> => {
    if (userId) {
      return cloudGetSavedLists(userId);
    }
    return localGetSavedLists();
  };

  const saveList = async (list: SavedList): Promise<boolean> => {
    if (userId) {
      return cloudSaveList(userId, list);
    }
    return localSaveList(list);
  };

  const updateSavedList = async (list: SavedList): Promise<boolean> => {
    if (userId) {
      return cloudUpdateSavedList(userId, list);
    }
    return localUpdateSavedList(list);
  };

  const deleteSavedList = async (listId: string): Promise<boolean> => {
    if (userId) {
      return cloudDeleteSavedList(userId, listId);
    }
    return localDeleteSavedList(listId);
  };

  // ========== SHOPPING HISTORY ==========

  const getShoppingHistory = async (): Promise<ShoppingHistory[]> => {
    if (userId) {
      return cloudGetShoppingHistory(userId);
    }
    return localGetShoppingHistory();
  };

  const saveShoppingHistory = async (history: ShoppingHistory): Promise<boolean> => {
    if (userId) {
      return cloudSaveShoppingHistory(userId, history);
    }
    return localSaveShoppingHistory(history);
  };

  const deleteShoppingHistory = async (historyId: string): Promise<boolean> => {
    if (userId) {
      return cloudDeleteShoppingHistory(userId, historyId);
    }
    return localDeleteShoppingHistory(historyId);
  };

  const clearAllHistory = async (): Promise<boolean> => {
    if (userId) {
      return cloudClearAllHistory(userId);
    }
    return localClearAllHistory();
  };

  return {
    // User state
    isLoggedIn: !!userId,
    userId,
    
    // Saved lists
    getSavedLists,
    saveList,
    updateSavedList,
    deleteSavedList,
    
    // Shopping history
    getShoppingHistory,
    saveShoppingHistory,
    deleteShoppingHistory,
    clearAllHistory,
  };
};
