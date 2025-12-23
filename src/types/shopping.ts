export type Unit = 'units' | 'kg' | 'g' | 'package';

export const UNITS = [
  { value: 'units', labelHe: "יח'", labelEn: 'units' },
  { value: 'g', labelHe: 'גרם', labelEn: 'g' },
  { value: 'kg', labelHe: 'ק"ג', labelEn: 'kg' },
  { value: 'package', labelHe: 'חבילה', labelEn: 'package' },
] as const;

// Shopping types
export type ShoppingType = 'supermarket' | 'online' | 'convenience' | 'market' | 'pharmacy';

export const SHOPPING_TYPES = [
  { value: 'supermarket' as const, labelHe: 'קנייה בסופר', labelEn: 'Supermarket', icon: '🛒' },
  { value: 'online' as const, labelHe: 'קנייה באינטרנט', labelEn: 'Online Shopping', icon: '📦' },
  { value: 'convenience' as const, labelHe: 'חנות נוחות', labelEn: 'Convenience Store', icon: '🏪' },
  { value: 'market' as const, labelHe: 'שוק/ירקות', labelEn: 'Market', icon: '🥬' },
  { value: 'pharmacy' as const, labelHe: 'בית מרקחת', labelEn: 'Pharmacy', icon: '💊' },
] as const;

// Stores by shopping type
export const STORES_BY_TYPE: Record<ShoppingType, readonly string[]> = {
  supermarket: [
    "שופרסל",
    "רמי לוי", 
    "ויקטורי",
    "יינות ביתן",
    "מחסני השוק",
    "שופרסל דיל",
    "יוחננוף",
    "מגה בעיר",
    "טיב טעם",
    "חצי חינם",
    "אושר עד",
    "סטופ מרקט",
    "אחר",
  ],
  online: [
    "Amazon",
    "eBay",
    "AliExpress",
    "SHEIN",
    "ASOS",
    "iHerb",
    "KSP",
    "זאפ",
    "ווליס",
    "Next",
    "Temu",
    "ZARA",
    "H&M",
    "Terminalx",
    "אחר",
  ],
  convenience: [
    "AM:PM",
    "קופיקס",
    "Yellow",
    "סופר יודה",
    "גוד פארם",
    "מכולת שכונתית",
    "אחר",
  ],
  market: [
    "שוק הכרמל",
    "שוק מחנה יהודה",
    "שוק הפשפשים",
    "שוק לווינסקי",
    "ירקן שכונתי",
    "חנות טבע",
    "אחר",
  ],
  pharmacy: [
    "סופר פארם",
    "Be",
    "גוד פארם",
    "ניו פארם",
    "אחר",
  ],
} as const;

export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
  quantity: number;
  unit: Unit;
  pinned?: boolean;
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
  listName?: string;
  items: ShoppingItem[];
  totalAmount: number;
  store: string;
  completedItems: number;
  totalItems: number;
  shoppingType?: ShoppingType;
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

// Legacy constant - keeping for backwards compatibility
export const ISRAELI_STORES = STORES_BY_TYPE.supermarket;
