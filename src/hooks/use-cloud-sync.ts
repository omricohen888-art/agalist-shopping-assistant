import { useCallback } from "react";
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

  const getSavedLists = useCallback(async (): Promise<SavedList[]> => {
    try {
      if (userId) {
        return await cloudGetSavedLists(userId);
      }
      return localGetSavedLists();
    } catch (error) {
      console.error("[CloudSync] getSavedLists error:", error);
      // Fallback to local storage on error
      return localGetSavedLists();
    }
  }, [userId]);

  const saveList = useCallback(async (list: SavedList): Promise<boolean> => {
    try {
      if (userId) {
        return await cloudSaveList(userId, list);
      }
      return localSaveList(list);
    } catch (error) {
      console.error("[CloudSync] saveList error:", error);
      // Try local storage as fallback
      return localSaveList(list);
    }
  }, [userId]);

  const updateSavedList = useCallback(async (list: SavedList): Promise<boolean> => {
    try {
      if (userId) {
        return await cloudUpdateSavedList(userId, list);
      }
      return localUpdateSavedList(list);
    } catch (error) {
      console.error("[CloudSync] updateSavedList error:", error);
      return false;
    }
  }, [userId]);

  const deleteSavedList = useCallback(async (listId: string): Promise<boolean> => {
    try {
      if (userId) {
        return await cloudDeleteSavedList(userId, listId);
      }
      return localDeleteSavedList(listId);
    } catch (error) {
      console.error("[CloudSync] deleteSavedList error:", error);
      return false;
    }
  }, [userId]);

  // ========== SHOPPING HISTORY ==========

  const getShoppingHistory = useCallback(async (): Promise<ShoppingHistory[]> => {
    try {
      if (userId) {
        return await cloudGetShoppingHistory(userId);
      }
      return localGetShoppingHistory();
    } catch (error) {
      console.error("[CloudSync] getShoppingHistory error:", error);
      return localGetShoppingHistory();
    }
  }, [userId]);

  const saveShoppingHistory = useCallback(async (history: ShoppingHistory): Promise<boolean> => {
    try {
      if (userId) {
        return await cloudSaveShoppingHistory(userId, history);
      }
      return localSaveShoppingHistory(history);
    } catch (error) {
      console.error("[CloudSync] saveShoppingHistory error:", error);
      return localSaveShoppingHistory(history);
    }
  }, [userId]);

  const deleteShoppingHistory = useCallback(async (historyId: string): Promise<boolean> => {
    try {
      if (userId) {
        return await cloudDeleteShoppingHistory(userId, historyId);
      }
      return localDeleteShoppingHistory(historyId);
    } catch (error) {
      console.error("[CloudSync] deleteShoppingHistory error:", error);
      return false;
    }
  }, [userId]);

  const clearAllHistory = useCallback(async (): Promise<boolean> => {
    try {
      if (userId) {
        return await cloudClearAllHistory(userId);
      }
      return localClearAllHistory();
    } catch (error) {
      console.error("[CloudSync] clearAllHistory error:", error);
      return false;
    }
  }, [userId]);

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
