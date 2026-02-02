import { supabase } from "@/integrations/supabase/client";
import { SavedList, ShoppingHistory, ShoppingItem } from "@/types/shopping";
import { Json } from "@/integrations/supabase/types";

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
  const { error } = await supabase
    .from("saved_lists")
    .insert({
      id: list.id,
      user_id: userId,
      name: list.name,
      items: list.items as unknown as Json,
      store: null,
      created_at: list.createdAt,
    });

  if (error) {
    console.error("Failed to save list to cloud:", error);
    return false;
  }

  return true;
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
  const { error } = await supabase
    .from("shopping_history")
    .insert({
      id: history.id,
      user_id: userId,
      store: history.store,
      items: history.items as unknown as Json,
      total_items: history.totalItems,
      checked_items: history.completedItems,
      started_at: history.date,
      completed_at: history.date,
    });

  if (error) {
    console.error("Failed to save shopping history to cloud:", error);
    return false;
  }

  return true;
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
