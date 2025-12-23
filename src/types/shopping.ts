export type Unit = 'units' | 'kg' | 'g' | 'package';

export const UNITS = [
  { value: 'units', labelHe: "יח'", labelEn: 'units' },
  { value: 'g', labelHe: 'גרם', labelEn: 'g' },
  { value: 'kg', labelHe: 'ק"ג', labelEn: 'kg' },
  { value: 'package', labelHe: 'חבילה', labelEn: 'package' },
] as const;

export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
  quantity: number;
  unit: Unit;
}

export interface SmartItem {
  id: string;
  text: string;
  isChecked: boolean;
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
  isShoppingComplete?: boolean;
  shoppingCompletedAt?: string;
  shoppingDuration?: number; // in seconds
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
