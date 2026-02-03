import { supabase } from "@/integrations/supabase/client";
import { SavedList, ShoppingHistory, ShoppingItem } from "@/types/shopping";
import { Json, TablesInsert } from "@/integrations/supabase/types";

// Convert Supabase format to app format
const toSavedList = (row: {
  id: string;
  user_id: string;
  name: string;
  items: Json;
  store: string | null;
  created_at: string;
  updated_at: string;
}): SavedList => ({
  id: row.id,
  name: row.name,
  items: (row.items as unknown as ShoppingItem[]) || [],
  createdAt: row.created_at,
});

const toShoppingHistory = (row: {
  id: string;
  user_id: string;
  store: string | null;
  items: Json;
  total_items: number;
  checked_items: number;
  started_at: string;
  completed_at: string;
  created_at: string;
}): ShoppingHistory => ({
  id: row.id,
  date: row.completed_at,
  items: (row.items as unknown as ShoppingItem[]) || [],
  totalAmount: 0,
  store: row.store || "",
  completedItems: row.checked_items,
  totalItems: row.total_items,
});

// ========== SAVED LISTS ==========

export const cloudGetSavedLists = async (userId: string): Promise<SavedList[]> => {
  const { data, error } = await supabase
    .from("saved_lists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch saved lists from cloud:", error);
    return [];
  }

  return (data || []).map(row => toSavedList(row));
};

export const cloudSaveList = async (userId: string, list: SavedList): Promise<boolean> => {
  console.log('Attempting save with User ID (cloudSaveList):', userId);
  console.log('[cloudSaveList] List ID being used:', list.id, 'Type:', typeof list.id);

  if (!userId) {
    console.error(
      '%c[cloudSaveList] User not authenticated – aborting Supabase insert',
      'color: red; font-size: 16px; font-weight: bold;'
    );
    throw new Error('User not authenticated');
  }

  // Simple payload - accept any string ID (numeric timestamps are fine)
  const payload: TablesInsert<"saved_lists"> = {
    id: String(list.id), // Ensure it's a string
    user_id: userId,
    name: list.name,
    items: list.items as unknown as Json,
    store: null,
    created_at: list.createdAt,
    // updated_at is optional and can be provided by the database default
  };

  console.log("[cloudSaveList] Insert payload:", payload);

  try {
    const { data, error } = await supabase
      .from("saved_lists")
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      console.group(
        "%cSupabase Save Debug (saved_lists insert)",
        "color: red; font-size: 16px; font-weight: bold;"
      );
      console.log("User ID:", userId);
      console.log("Anon Key Loaded:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      console.error("Full Error Object:", error);
      console.log("Error Code:", (error as any)?.code);
      console.log("Error Message:", (error as any)?.message);
      console.log("Error Details:", (error as any)?.details);
      console.groupEnd();
      return false;
    }

    // Log the saved row from the database for debugging
    console.log("[cloudSaveList] Saved row from Supabase:", data);

    return true;
  } catch (error: any) {
    console.group(
      "%cSupabase Save Debug (saved_lists insert - exception)",
      "color: red; font-size: 16px; font-weight: bold;"
    );
    console.log("User ID:", userId);
    console.log("Anon Key Loaded:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    console.error("Full Error Object:", error);
    console.log("Error Message:", error?.message);
    console.log("Error Details:", (error as any)?.details);
    console.groupEnd();
    return false;
  }
};

export const cloudUpdateSavedList = async (userId: string, list: SavedList): Promise<boolean> => {
  const { error } = await supabase
    .from("saved_lists")
    .update({
      name: list.name,
      items: list.items as unknown as Json,
    })
    .eq("id", list.id)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to update list in cloud:", error);
    return false;
  }

  return true;
};

export const cloudDeleteSavedList = async (userId: string, listId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("saved_lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete list from cloud:", error);
    return false;
  }

  return true;
};

export const cloudDeleteAllSavedLists = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("saved_lists")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete all lists from cloud:", error);
    return false;
  }

  return true;
};

// ========== SHOPPING HISTORY ==========

export const cloudGetShoppingHistory = async (userId: string): Promise<ShoppingHistory[]> => {
  const { data, error } = await supabase
    .from("shopping_history")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch shopping history from cloud:", error);
    return [];
  }

  return (data || []).map(row => toShoppingHistory(row));
};

export const cloudSaveShoppingHistory = async (userId: string, history: ShoppingHistory): Promise<boolean> => {
  const payload: TablesInsert<"shopping_history"> = {
    id: String(history.id), // Accept any string ID
    user_id: userId,
    store: history.store,
    items: history.items as unknown as Json,
    total_items: history.totalItems,
    checked_items: history.completedItems,
    started_at: history.date,
    completed_at: history.date,
    // created_at is optional and defaults in the database
  };

  try {
    const { error } = await supabase.from("shopping_history").insert(payload);

    if (error) {
      console.error(
        "%cFULL SUPABASE ERROR (shopping_history insert):",
        "color: red; font-size: 16px; font-weight: bold;",
        error,
        (error as any).message,
        (error as any).details
      );
      return false;
    }

    return true;
  } catch (error: any) {
    console.error(
      "%cFULL SUPABASE ERROR (caught exception during shopping_history insert):",
      "color: red; font-size: 16px; font-weight: bold;",
      error,
      error?.message,
      error?.details
    );
    return false;
  }
};

export const cloudDeleteShoppingHistory = async (userId: string, historyId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("shopping_history")
    .delete()
    .eq("id", historyId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete shopping history from cloud:", error);
    return false;
  }

  return true;
};

export const cloudClearAllHistory = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("shopping_history")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to clear all history from cloud:", error);
    return false;
  }

  return true;
};
