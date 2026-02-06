# Visual Architecture & Flow Diagrams

## Component Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        ShoppingList.tsx                       │
│                    (Main Container Component)                 │
│                                                                │
│  State:                                                        │
│  - items: ShoppingItem[]                                      │
│  - isSmartSort: boolean ← Smart Sort Toggle Controls This     │
│  - language: 'he' | 'en'                                      │
│  - activeListId: string                                       │
│  - ... other state                                            │
│                                                                │
│                                                                │
│  ┌───────────────────────────────────────────────────────┐   │
│  │            Items Rendering Logic                       │   │
│  │                                                         │   │
│  │  if (isSmartSort) {                                   │   │
│  │    return <GroupedShoppingList ... />                 │   │
│  │  } else {                                             │   │
│  │    return <FlatList /> /* Original view */            │   │
│  │  }                                                     │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                                │
└──────────────────────────────────────────────────────────────┘
         ↑                                         ↑
         │                                         │
         └─────────────────┬──────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
      ┌─────▼──────────┐         ┌─────────▼──────────┐
      │GroupedShopping │         │  Original Flat     │
      │    List.tsx    │         │  List View         │
      │                │         │                    │
      │ • Groups items │         │ • Single list      │
      │ • Manages      │         │ • Chronological    │
      │   collapse     │         │ • No grouping      │
      │ • Renders      │         │                    │
      │   headers      │         │ (Production-ready) │
      └─────┬──────────┘         └────────────────────┘
            │
            │ (When isSmartSort = true)
            │
      ┌─────▼──────────────────┐
      │  For Each Category:     │
      │                         │
      │  ┌──────────────────┐  │
      │  │  CategoryHeader  │  │
      │  │  .tsx            │  │
      │  │                  │  │
      │  │ • Icon + Name    │  │
      │  │ • Item counts    │  │
      │  │ • Collapse btn   │  │
      │  │ • Animations     │  │
      │  └──────────────────┘  │
      │           │             │
      │           ↓             │
      │  ┌──────────────────┐  │
      │  │ ShoppingListItem │  │
      │  │ (x items in      │  │
      │  │  category)       │  │
      │  └──────────────────┘  │
      │                         │
      └─────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

User Adds Items
  ↓
handleAddBulkItems() / handlePaste()
  ├─ Parse input
  ├─ Create ShoppingItem[]
  └─ If isSmartSort: sortByCategory()
       ↓
setItems([...items]) ← Update state
       ↓
ShoppingList re-renders
       ↓
isSmartSort check:
       │
       ├─ TRUE → GroupedShoppingList renders
       │         ↓
       │      groupByCategory() utility
       │         ↓
       │      Organize into Map<CategoryKey, Items[]>
       │         ↓
       │      Render loop:
       │      For each CategoryKey in CATEGORY_ORDER:
       │         ├─ Get category items
       │         ├─ Render CategoryHeader (collapsed?)
       │         └─ Render ShoppingListItem[] (if not collapsed)
       │
       └─ FALSE → Flat list renders (original)


╔════════════════════════════════════════════════════════════════╗
║             COLLAPSE/EXPAND INTERACTION                        ║
╚════════════════════════════════════════════════════════════════╝

User clicks CategoryHeader
  ↓
toggleCollapsed(categoryKey)
  ↓
setCollapsedCategories(newSet)
  ├─ If category was not in set → Add it (collapse)
  └─ If category was in set → Remove it (expand)
  ↓
GroupedShoppingList re-renders
  ↓
CategoryHeader receives updated isCollapsed prop
  ├─ Chevron icon rotates (CSS animation)
  └─ Items visibility toggles (conditional render)
  ↓
Smooth animation completes (300ms)
  ↓
User sees collapsed/expanded category
```

## Category Matching Flow

```
┌─────────────────────────────────────────────────────────────┐
│              ITEM CATEGORIZATION PROCESS                     │
└─────────────────────────────────────────────────────────────┘

Item Text Input
│
├─ Example 1: "תפוח אדום"
│   ↓
│   detectCategory("תפוח אדום")
│   ├─ Convert to lowercase: "תפוח אדום"
│   ├─ Loop through CATEGORIES
│   ├─ Check keywords for each category:
│   │  └─ Produce keywords: ['תפוח', 'בננ', 'עגבני', ...]
│   ├─ MATCH FOUND: "תפוח" ✓
│   └─ Return: 'produce'
│   ↓
│   categoryInfo = getCategoryInfo('produce')
│   ├─ icon: '🥬'
│   ├─ nameHe: 'פירות וירקות'
│   ├─ nameEn: 'Produce'
│   └─ keywords: [...]
│
├─ Example 2: "עוף קפוא"
│   ↓
│   detectCategory("עוף קפוא")
│   ├─ Meat keywords: ['עוף', ...] ← PRIORITY MATCH
│   ├─ Frozen keywords: ['קפוא', ...]
│   ├─ KEYWORD PRECEDENCE: Meat comes first in category order
│   └─ Return: 'meat' (not 'frozen')
│
└─ Example 3: "משהו מוזר 12345"
    ↓
    detectCategory("משהו מוזר 12345")
    ├─ No keyword matches in any category
    ├─ Check 'other' category: keywords = []
    └─ Return: 'other' (fallback)

┌─────────────────────────────────────────────────────────────┐
│        KEYWORD DATABASE STRUCTURE                            │
└─────────────────────────────────────────────────────────────┘

CATEGORIES[0] = {
  key: 'produce',
  nameHe: 'פירות וירקות',
  nameEn: 'Produce',
  icon: '🥬',
  keywords: [
    // Hebrew keywords (alphabetical)
    'אבוקדו', 'אננס', 'אפרסק', 'אשכולית',
    'בטטה', 'בוטן', 'בצל', 'ברוקולי', 'בננ',
    'גזר', 'גרגירי חומוס',
    'דלעת',
    'עגבני', 'ענב',
    'תות', 'תפוח', 'תפוחי אדמה', 'תפוז',
    // English keywords
    'apple', 'avocado', 'banana', 'bean',
    'broccoli', 'cabbage', 'carrot', 'cauliflower',
    'cucumber', 'fruit', 'garlic', 'grape',
    'lettuce', 'melon', 'onion', 'orange',
    'pear', 'pepper', 'salad', 'strawberry',
    'tomato', 'vegetable', 'watermelon'
  ]
}

CATEGORIES[1] = {
  key: 'dairy',
  nameHe: 'מוצרי חלב',
  nameEn: 'Dairy',
  icon: '🥛',
  keywords: [
    // Hebrew
    'גבינ', 'גאודה', 'לבנה', 'מוצרלה', 'מילקי',
    'שמנת', 'שמנת חמוצה', 'צהובה', 'קוטג',
    'חלב', 'חמאה', 'יוגורט',
    // English
    'butter', 'cheddar', 'cheese', 'cottage',
    'cream', 'feta', 'gouda', 'milk', 'mozzarella',
    'ricotta', 'yogurt'
  ]
}

... (9 more categories)
```

## State Management Diagram

```
┌──────────────────────────────────────────────┐
│    GroupedShoppingList Component              │
│                                               │
│  Props (from parent ShoppingList):           │
│  ├─ items: ShoppingItem[]                    │
│  ├─ language: 'he' | 'en'                    │
│  ├─ onToggle: (id) => void                   │
│  ├─ onDelete: (id) => void                   │
│  ├─ onQuantityChange: (id, qty) => void      │
│  └─ onUnitChange: (id, unit) => void         │
│                                               │
│  Local State:                                │
│  const [collapsedCategories, setCollapsed]   │
│    = useState<Set<CategoryKey>>(new Set())   │
│                                               │
│  Memoized Values:                            │
│  const groupedItems = useMemo(() => {        │
│    1. Call groupByCategory(items)            │
│    2. For each CategoryKey in CATEGORY_ORDER │
│    3. If has items:                          │
│       ├─ Get categoryInfo                    │
│       ├─ Get pending/completed split         │
│       └─ Add to result array                 │
│  }, [items])                                 │
│                                               │
│  Computed Values (during render):            │
│  ├─ totalPending = items.filter(!checked)    │
│  ├─ totalCompleted = items.filter(checked)   │
│  └─ toggleCollapsed = Set toggle function    │
│                                               │
└──────────────────────────────────────────────┘
         ↓                              ↓
    ┌────────────────────┐   ┌──────────────────┐
    │  CategoryHeader    │   │ ShoppingListItem │
    │  (x categories)    │   │ (x items)        │
    └────────────────────┘   └──────────────────┘
```

## Rendering Decision Tree

```
                      ┌─ ShoppingList.tsx
                      │
                      ├─ isSmartSort?
                      │
         ┌────────────┴────────────┐
         │                         │
       TRUE                      FALSE
         │                         │
         ▼                         ▼
┌─────────────────┐      ┌────────────────┐
│ GroupedShopping │      │  Flat List     │
│ List Component  │      │  Component     │
│                 │      │                │
│ groupByCategory │      │ filter(!checked)
│ Loop through    │      │ + 
│ categories      │      │ filter(checked)
│ Render headers  │      │ separator
│ + items         │      │ + 
│                 │      │ (original)
└─────────────────┘      └────────────────┘

         │
         ├─ Category 1 (Produce)
         │  ├─ Header: 🥬 Produce [3] ✓2
         │  ├─ Pending items (if not collapsed)
         │  └─ Completed items (if not collapsed)
         │
         ├─ Category 2 (Dairy)
         │  ├─ Header: 🥛 Dairy [2] ✓1
         │  └─ Items...
         │
         ├─ Category 3 (Meat)
         │  └─ Items...
         │
         └─ Category N (Other)
            └─ Items...
```

## Performance Optimization

```
┌────────────────────────────────────────────────────────────┐
│              PERFORMANCE CONSIDERATIONS                     │
└────────────────────────────────────────────────────────────┘

Grouping Operation:
  groupByCategory(items)
  ├─ Time: O(n) - single loop through items
  ├─ Space: O(n) - new Map structure
  └─ Optimization: useMemo (only runs when items change)

Collapse State:
  collapsedCategories Set<CategoryKey>
  ├─ Size: Max 11 entries (one per category)
  ├─ Operation: O(1) add/remove
  └─ Impact: Negligible on performance

Re-render Optimization:
  ├─ Parent (ShoppingList) may re-render for many reasons
  ├─ But GroupedShoppingList only re-groups if items changed
  ├─ useMemo prevents unnecessary grouping
  └─ Collapse toggle doesn't cause regrouping

Animation Performance:
  ├─ CSS transforms (rotate chevron): GPU-accelerated
  ├─ Opacity changes: GPU-accelerated
  ├─ No JS animation frames needed
  └─ Smooth 60fps on modern devices

Bundle Size Impact:
  ├─ CategoryHeader.tsx: ~3KB
  ├─ GroupedShoppingList.tsx: ~4KB
  ├─ Total new code: ~7KB (minified)
  ├─ No new dependencies
  └─ Minor impact on bundle (~0.4%)
```

## Responsive Design Breakpoints

```
┌─────────────────────────────────────────────────────────┐
│              RESPONSIVE DESIGN FLOW                      │
└─────────────────────────────────────────────────────────┘

Screen Size: <640px (Mobile)
├─ Header layout: Compact
├─ Icon size: 24px
├─ Text size: 16px
├─ Padding: 12px
├─ Badges: Small
└─ Tap targets: 40-44px

Screen Size: 640px-1024px (Tablet)
├─ Header layout: Balanced
├─ Icon size: 28px
├─ Text size: 18px
├─ Padding: 16px
├─ Badges: Medium
└─ Tap targets: 44px

Screen Size: >1024px (Desktop)
├─ Header layout: Spacious
├─ Icon size: 32px
├─ Text size: 20px
├─ Padding: 20px
├─ Badges: Large
└─ Click targets: 44px+

CSS Classes Used:
├─ text-lg sm:text-2xl → Responsive text
├─ h-5 sm:h-6 → Responsive icons
├─ px-4 sm:px-5 → Responsive padding
├─ gap-3 sm:gap-4 → Responsive spacing
└─ space-y-4 sm:space-y-5 → Responsive gaps
```

---

**These diagrams provide a complete visual understanding of the architecture, data flow, and interactions in the Grouped List View implementation.**
