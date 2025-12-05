// Category definitions for smart sorting
export const CATEGORY_ORDER = [
  'produce',
  'dairy',
  'meat',
  'bakery',
  'pantry',
  'frozen',
  'snacks',
  'drinks',
  'cleaning',
  'pharma',
  'other'
] as const;

export type CategoryKey = typeof CATEGORY_ORDER[number];

export interface CategoryInfo {
  key: CategoryKey;
  nameHe: string;
  nameEn: string;
  icon: string;
  keywords: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    key: 'produce',
    nameHe: 'פירות וירקות',
    nameEn: 'Produce',
    icon: '🥬',
    keywords: [
      // Hebrew
      'תפוח', 'בננ', 'תפוז', 'לימון', 'עגבני', 'מלפפון', 'פלפל', 'בצל', 'שום', 
      'גזר', 'סלרי', 'חסה', 'נענע', 'כוסברה', 'פטרוזיליה', 'אבוקדו', 'קישוא',
      'ענב', 'תות', 'אשכולית', 'אננס', 'מנגו', 'אפרסק', 'נקטרינה', 'שזיף',
      'כרוב', 'ברוקולי', 'כרובית', 'חציל', 'דלעת', 'בטטה', 'תפוחי אדמה',
      'פטריות', 'זוקיני', 'ירק', 'פרי', 'סלט', 'עלי',
      // English
      'apple', 'banana', 'orange', 'lemon', 'tomato', 'cucumber', 'pepper', 'onion', 
      'garlic', 'carrot', 'celery', 'lettuce', 'mint', 'cilantro', 'parsley', 'avocado',
      'grape', 'strawberry', 'melon', 'watermelon', 'mango', 'peach', 'plum',
      'cabbage', 'broccoli', 'cauliflower', 'eggplant', 'squash', 'potato', 'vegetable', 'fruit', 'salad'
    ]
  },
  {
    key: 'dairy',
    nameHe: 'מוצרי חלב',
    nameEn: 'Dairy',
    icon: '🥛',
    keywords: [
      // Hebrew
      'חלב', 'יוגורט', 'קוטג', 'גבינ', 'חמאה', 'שמנת', 'מוצרלה', 'לבנה', 'פטה',
      'ריקוטה', 'גאודה', 'עמק', 'צהובה', 'לבנה', 'בולגרית', 'שמנת חמוצה',
      'פודינג', 'מילקי', 'דנונה',
      // English
      'milk', 'yogurt', 'cottage', 'cheese', 'butter', 'cream', 'mozzarella', 'feta',
      'ricotta', 'gouda', 'cheddar', 'sour cream', 'pudding'
    ]
  },
  {
    key: 'meat',
    nameHe: 'בשר ודגים',
    nameEn: 'Meat & Fish',
    icon: '🥩',
    keywords: [
      // Hebrew
      'עוף', 'בקר', 'כבש', 'הודו', 'סטייק', 'נקניק', 'קציצ', 'סלמון', 'טונה',
      'דג', 'פילה', 'שניצל', 'קבב', 'כנף', 'ירך', 'חזה', 'טחון', 'שרימפס',
      'נתחי', 'פרגית', 'אנטריקוט', 'צלעות', 'כבד', 'סרדין', 'דניס', 'בורי', 'לברק',
      // English
      'chicken', 'beef', 'lamb', 'turkey', 'steak', 'sausage', 'salmon', 'tuna',
      'fish', 'fillet', 'schnitzel', 'kebab', 'wing', 'thigh', 'breast', 'ground', 'shrimp'
    ]
  },
  {
    key: 'bakery',
    nameHe: 'מאפים ולחם',
    nameEn: 'Bakery',
    icon: '🥖',
    keywords: [
      // Hebrew
      'לחם', 'פיתה', 'לחמני', 'בגט', 'עוג', 'קרואסון', 'בייגל', 'חלה', 'טורטיה',
      'מאפה', 'רול', 'שמרים', 'עוגיות', 'ביסקוויט', 'קרקר',
      // English
      'bread', 'pita', 'bun', 'baguette', 'cake', 'croissant', 'bagel', 'challah', 'tortilla',
      'pastry', 'roll', 'cookie', 'biscuit', 'cracker'
    ]
  },
  {
    key: 'pantry',
    nameHe: 'מזווה יבש',
    nameEn: 'Pantry',
    icon: '🥫',
    keywords: [
      // Hebrew
      'אורז', 'פסטה', 'שמן', 'קמח', 'סוכר', 'מלח', 'פלפל', 'קפה', 'תה', 'קטשופ',
      'מיונז', 'חרדל', 'חומץ', 'רסק', 'שימורים', 'תבלין', 'דבש', 'ריבה', 'טחינה',
      'חומוס', 'עדשים', 'שעועית', 'גרגירי חומוס', 'קוואקר', 'קורנפלקס', 'סילאן',
      'נודלס', 'ספגטי', 'מקרוני', 'פנה', 'פתיתים', 'בורגול', 'קינואה', 'קוסקוס',
      // English
      'rice', 'pasta', 'oil', 'flour', 'sugar', 'salt', 'pepper', 'coffee', 'tea', 'ketchup',
      'mayonnaise', 'mustard', 'vinegar', 'sauce', 'canned', 'spice', 'honey', 'jam', 'tahini',
      'hummus', 'lentils', 'beans', 'chickpea', 'oat', 'cereal', 'noodle', 'spaghetti'
    ]
  },
  {
    key: 'frozen',
    nameHe: 'קפואים',
    nameEn: 'Frozen',
    icon: '🧊',
    keywords: [
      // Hebrew
      'קפוא', 'פיצה קפואה', 'גלידה', 'שלגון', 'ארטיק', 'ירקות קפואים', 'בורקס',
      'קרוסטינה', 'פלאפל קפוא', 'מוקפא', 'פרוזן',
      // English
      'frozen', 'ice cream', 'popsicle', 'pizza frozen', 'frozen vegetable'
    ]
  },
  {
    key: 'snacks',
    nameHe: 'חטיפים ומתוקים',
    nameEn: 'Snacks & Sweets',
    icon: '🍫',
    keywords: [
      // Hebrew
      'במבה', 'ביסלי', 'טפוצ', 'שוקולד', 'מסטיק', 'סוכרי', 'ופל', 'חטיף', 'צ\'יפס',
      'פיצוח', 'אגוז', 'שקד', 'בוטן', 'חמאת בוטנים', 'נוטלה', 'קינדר', 'פרה',
      'עוגיות', 'עוגה', 'קרמבו', 'צימוק', 'פצפוצי אורז',
      // English
      'bamba', 'bisli', 'chips', 'chocolate', 'gum', 'candy', 'wafer', 'snack',
      'nuts', 'almond', 'peanut', 'nutella', 'kinder', 'raisin'
    ]
  },
  {
    key: 'drinks',
    nameHe: 'משקאות',
    nameEn: 'Drinks',
    icon: '🥤',
    keywords: [
      // Hebrew
      'קולה', 'ספרייט', 'פנטה', 'מים', 'מיץ', 'בירה', 'יין', 'וודקה', 'ויסקי',
      'סודה', 'אנרג', 'לימונדה', 'פיוז', 'נביעות', 'עדן', 'מי עדן', 'משקה',
      // English
      'cola', 'sprite', 'fanta', 'water', 'juice', 'beer', 'wine', 'vodka', 'whisky',
      'soda', 'energy', 'lemonade', 'drink', 'beverage'
    ]
  },
  {
    key: 'cleaning',
    nameHe: 'ניקיון ובית',
    nameEn: 'Cleaning & Home',
    icon: '🧹',
    keywords: [
      // Hebrew
      'אקונומיקה', 'נוזל רצפות', 'סבון כלים', 'אבקת כביס', 'נייר טואלט', 'שקיות אשפה',
      'נייר אלומיניום', 'נייר סופג', 'מרכך כביסה', 'אקונומיקה', 'מטליות', 'ספוג',
      'מברשת', 'פטיש', 'מגב', 'נרות', 'גפרורים', 'עגלת קניות', 'סל כביסה',
      // English
      'bleach', 'floor cleaner', 'dish soap', 'laundry', 'toilet paper', 'trash bag',
      'aluminum foil', 'paper towel', 'softener', 'sponge', 'brush', 'mop', 'candle'
    ]
  },
  {
    key: 'pharma',
    nameHe: 'פארם ותינוקות',
    nameEn: 'Pharma & Baby',
    icon: '💊',
    keywords: [
      // Hebrew
      'חיתול', 'מגבונים', 'שמפו', 'משחת שיניים', 'סבון גוף', 'דאודורנט', 'קרם',
      'תחבושות', 'כדורים', 'ויטמין', 'פלסטר', 'אקמול', 'נורופן', 'מברשת שיניים',
      'חוט דנטלי', 'מי פה', 'תחליב גוף', 'קרם לחות', 'קרם שיזוף', 'סרק',
      // English
      'diaper', 'wipes', 'shampoo', 'toothpaste', 'soap', 'deodorant', 'cream',
      'bandage', 'pill', 'vitamin', 'plaster', 'painkiller', 'toothbrush', 'lotion', 'sunscreen'
    ]
  },
  {
    key: 'other',
    nameHe: 'אחר',
    nameEn: 'Other',
    icon: '📦',
    keywords: []
  }
];

/**
 * Detect category for a single item
 */
export function detectCategory(itemText: string): CategoryKey {
  const lowerText = itemText.toLowerCase();
  
  for (const category of CATEGORIES) {
    if (category.key === 'other') continue;
    
    for (const keyword of category.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category.key;
      }
    }
  }
  
  return 'other';
}

/**
 * Get category info by key
 */
export function getCategoryInfo(key: CategoryKey): CategoryInfo {
  return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
}

/**
 * Sort items by category
 */
export function sortByCategory<T extends { text: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const categoryA = detectCategory(a.text);
    const categoryB = detectCategory(b.text);
    
    const indexA = CATEGORY_ORDER.indexOf(categoryA);
    const indexB = CATEGORY_ORDER.indexOf(categoryB);
    
    return indexA - indexB;
  });
}

/**
 * Group items by category (for display purposes)
 */
export function groupByCategory<T extends { text: string }>(items: T[]): Map<CategoryKey, T[]> {
  const groups = new Map<CategoryKey, T[]>();
  
  // Initialize all categories
  for (const key of CATEGORY_ORDER) {
    groups.set(key, []);
  }
  
  // Categorize items
  for (const item of items) {
    const category = detectCategory(item.text);
    const group = groups.get(category) || [];
    group.push(item);
    groups.set(category, group);
  }
  
  // Remove empty categories
  for (const key of CATEGORY_ORDER) {
    if (groups.get(key)?.length === 0) {
      groups.delete(key);
    }
  }
  
  return groups;
}
