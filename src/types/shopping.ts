export type Unit = 'units' | 'kg' | 'g';

export const UNITS = [
  { value: 'units', labelHe: "יח'", labelEn: 'units' },
  { value: 'kg', labelHe: 'ק"ג', labelEn: 'kg' },
  { value: 'g', labelHe: 'גרם', labelEn: 'g' },
] as const;

export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
  quantity: number;
  unit: Unit;
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

export interface SavedList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
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
