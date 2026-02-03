import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { SavedList, ShoppingHistory } from "@/types/shopping";
import {
  cloudGetSavedLists,
  cloudSaveList,
  cloudUpdateSavedList,
  cloudDeleteSavedList,
  cloudDeleteAllSavedLists,
  cloudArchiveSavedLists,
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
  archiveSavedLists as localArchiveSavedLists,
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
    console.log('Attempting save with User ID (useCloudSync.saveList):', userId);

    // STEP 1: ALWAYS save locally first
    const localSuccess = localSaveList(list);
    if (!localSuccess) {
      console.error("[CloudSync] Failed to save locally");
      return false;
    }

    // STEP 2: Check if user is logged in
    if (!userId) {
      // Guest user: local save is complete, return success
      console.log("[CloudSync] Guest user - saved locally only");
      return true;
    }

    // STEP 3: Logged in user - sync to cloud
    try {
      const cloudSuccess = await cloudSaveList(userId, list);
      if (cloudSuccess) {
        console.log("[CloudSync] Successfully synced to cloud");
      } else {
        console.warn("[CloudSync] Local save succeeded but cloud sync failed");
      }
      // Return true because local save succeeded (cloud sync is optional)
      return true;
    } catch (error) {
      console.error("[CloudSync] Cloud sync error (but local save succeeded):", error);
      // Return true because local save succeeded
      return true;
    }
  }, [userId]);

  const updateSavedList = useCallback(async (list: SavedList): Promise<boolean> => {
    // STEP 1: ALWAYS save locally first
    const localSuccess = localUpdateSavedList(list);
    if (!localSuccess) {
      console.error("[CloudSync] Failed to update locally");
      return false;
    }

    // STEP 2: Check if user is logged in
    if (!userId) {
      // Guest user: local update is complete, return success
      console.log("[CloudSync] Guest user - updated locally only");
      return true;
    }

    // STEP 3: Logged in user - sync to cloud
    try {
      const cloudSuccess = await cloudUpdateSavedList(userId, list);
      if (cloudSuccess) {
        console.log("[CloudSync] Successfully synced update to cloud");
      } else {
        console.warn("[CloudSync] Local update succeeded but cloud sync failed");
      }
      // Return true because local update succeeded (cloud sync is optional)
      return true;
    } catch (error) {
      console.error("[CloudSync] Cloud sync error (but local update succeeded):", error);
      // Return true because local update succeeded
      return true;
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

  const archiveSavedLists = useCallback(async (listIds: string[]): Promise<boolean> => {
    try {
      // Always archive locally first
      const localSuccess = localArchiveSavedLists(listIds);
      if (!localSuccess) {
        console.error("[CloudSync] Failed to archive locally");
        return false;
      }

      // If guest, stop here
      if (!userId) {
        return true;
      }

      // If logged in, archive in cloud
      const cloudSuccess = await cloudArchiveSavedLists(userId, listIds);
      if (!cloudSuccess) {
        console.warn("[CloudSync] Local archive succeeded but cloud archive failed");
      }
      return true; // Return true because local archive succeeded
    } catch (error) {
      console.error("[CloudSync] archiveSavedLists error:", error);
      return false;
    }
  }, [userId]);

  const deleteAllSavedLists = useCallback(async (deleteFromCloud: boolean = false): Promise<boolean> => {
    try {
      // Always delete locally first
      const localLists = localGetSavedLists();
      localLists.forEach(list => {
        localDeleteSavedList(list.id);
      });
      // Clear localStorage directly
      localStorage.removeItem("saved_lists");

      // If guest or only deleting from device, stop here
      if (!userId || !deleteFromCloud) {
        return true;
      }

      // If logged in and deleteFromCloud is true, delete from cloud
      const cloudSuccess = await cloudDeleteAllSavedLists(userId);
      if (!cloudSuccess) {
        console.warn("[CloudSync] Local delete succeeded but cloud delete failed");
      }
      return true; // Return true because local delete succeeded
    } catch (error) {
      console.error("[CloudSync] deleteAllSavedLists error:", error);
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
    archiveSavedLists,
    deleteAllSavedLists,
    
    // Shopping history
    getShoppingHistory,
    saveShoppingHistory,
    deleteShoppingHistory,
    clearAllHistory,
  };
};
