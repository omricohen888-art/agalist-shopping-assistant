export type Unit = 'units' | 'kg' | 'g' | 'package';

export const UNITS = [
  { value: 'units', labelHe: "יח'", labelEn: 'units' },
  { value: 'g', labelHe: 'גרם', labelEn: 'g' },
  { value: 'kg', labelHe: 'ק"ג', labelEn: 'kg' },
  { value: 'package', labelHe: 'חבילה', labelEn: 'package' },
] as const;

// Shopping types
export type ShoppingType = 'supermarket' | 'online' | 'convenience' | 'market' | 'pharmacy' | 'clothing' | 'electronics' | 'home' | 'kids' | 'pets' | 'other';

export const SHOPPING_TYPES = [
  { value: 'supermarket' as const, labelHe: 'קנייה בסופר', labelEn: 'Supermarket', icon: '🛒' },
  { value: 'online' as const, labelHe: 'קנייה באינטרנט', labelEn: 'Online Shopping', icon: '📦' },
  { value: 'convenience' as const, labelHe: 'חנות נוחות', labelEn: 'Convenience Store', icon: '🏪' },
  { value: 'market' as const, labelHe: 'שוק/ירקות', labelEn: 'Market', icon: '🥬' },
  { value: 'pharmacy' as const, labelHe: 'בית מרקחת', labelEn: 'Pharmacy', icon: '💊' },
  { value: 'clothing' as const, labelHe: 'ביגוד ואופנה', labelEn: 'Clothing & Fashion', icon: '👕' },
  { value: 'electronics' as const, labelHe: 'אלקטרוניקה', labelEn: 'Electronics', icon: '📱' },
  { value: 'home' as const, labelHe: 'בית וגינה', labelEn: 'Home & Garden', icon: '🏠' },
  { value: 'kids' as const, labelHe: 'תינוקות וילדים', labelEn: 'Kids & Baby', icon: '🧸' },
  { value: 'pets' as const, labelHe: 'חיות מחמד', labelEn: 'Pet Store', icon: '🐾' },
  { value: 'other' as const, labelHe: 'אחר', labelEn: 'Other', icon: '🏷️' },
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
    "קרפור",
    "פרש מרקט",
    "נתיב החסד",
    "מכולת שכונתית",
    "קשת טעמים",
    "סלקום שוק",
    "ברקת",
    "זול ובגדול",
    "קינג סטור",
    "סופר ספיר",
    "חטיבת הצרכנות",
    "סופר דוש",
    "פרשמרקט",
    "מיני מרקט",
    "שוק העיר",
    "גוד מרקט",
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
    "באג",
    "איביי ישראל",
  ],
  convenience: [
    "AM:PM",
    "קופיקס",
    "Yellow",
    "סופר יודה",
    "גוד פארם",
    "מכולת שכונתית",
    "פז צהוב",
    "דלק",
    "סונול",
  ],
  market: [
    "שוק הכרמל",
    "שוק מחנה יהודה",
    "שוק הפשפשים",
    "שוק לווינסקי",
    "שוק הנמל",
    "שוק רמלה",
    "ירקן שכונתי",
    "חנות טבע",
  ],
  pharmacy: [
    "סופר פארם",
    "Be",
    "גוד פארם",
    "ניו פארם",
    "פארם אונליין",
  ],
  clothing: [
    "קסטרו",
    "גולף",
    "רנואר",
    "פוקס",
    "הודיס",
    "זארה",
    "H&M",
    "מנגו",
    "פול אנד בר",
    "Terminalx",
    "שילב",
    "אמריקן איגל",
  ],
  electronics: [
    "KSP",
    "באג",
    "איי דיגיטל",
    "מחסני חשמל",
    "זאפ",
    "עזריאלי.קום",
    "איקאה",
    "אייבורי",
  ],
  home: [
    "איקאה",
    "הום סנטר",
    "אייס",
    "ניו פארם",
    "סופר פארם",
    "מקס סטוק",
    "ג'מבו סטוק",
  ],
  kids: [
    "שילב",
    "באג'ו",
    "טויס אר אס",
    "קידס קלאב",
    "מרמלדה",
    "כתר פלסטיק",
  ],
  pets: [
    "פט קלאב",
    "פט פרינד",
    "סופר פט",
    "חנות לחיות",
  ],
  other: [],
} as const;

export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
  quantity: number;
  unit: Unit;
  pinned?: boolean;
  note?: string;
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
  is_archived?: boolean; // Soft delete flag - archived lists are hidden from dashboard
}

// Legacy constant - keeping for backwards compatibility
export const ISRAELI_STORES = STORES_BY_TYPE.supermarket;
