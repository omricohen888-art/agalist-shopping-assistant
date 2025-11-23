export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ShoppingHistory {
  id: string;
  date: string;
  items: ShoppingItem[];
  totalAmount: number;
  store: string;
  completedItems: number;
  totalItems: number;
}

export const ISRAELI_STORES = [
  "שופרסל",
  "רמי לוי",
  "ויקטורי",
  "יינות בי-תן",
  "מחסני השוק",
  "סופר פארם",
  "שופרסל דיל",
  "AM:PM",
  "יוחנניוף",
  "מגה בעיר",
  "טיב טעם",
  "קופיקס",
  "חצי חינם",
  "אחר",
] as const;
