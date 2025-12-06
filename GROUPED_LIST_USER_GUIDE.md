# Grouped List View - User Guide

## Quick Start

### Enabling Smart Sort with Visual Groups

1. **Add Items to Your List**
   - Paste items or type them manually
   - Items are automatically categorized in the background

2. **Enable Smart Sort**
   - Look for the **"Smart Sort"** toggle button
   - Click to enable the grouped view
   - Your list reorganizes into category sections immediately

3. **View Your Organized List**
   - Each category appears as a distinct section with a header
   - Headers show category icon and name (in your language)
   - Item counts are visible for each category

## Understanding the Headers

### Header Components

```
🥬 Produce  [2]  ✓1
└─ Category name + Icon
   └─ Pending items count (in blue badge)
      └─ Completed items count (with checkmark)
```

### What Each Element Means

| Element | Meaning | Example |
|---------|---------|---------|
| **Icon** 🥬 | Quick visual identifier for category | Emoji for produce, meat, dairy, etc. |
| **Name** | Category title in your language | "Produce", "פירות וירקות" (Hebrew) |
| **Badge [2]** | Number of items waiting to be bought | Blue badge showing pending items |
| **Checkmark ✓1** | Number of completed items in this section | Green badge showing completed |
| **Chevron ▼** | Click to collapse/expand category | Rotates when toggled |

## Using Collapse/Expand

### Why Collapse Categories?

You're at a grocery store with this list:
```
🥬 Produce [3]
  ├─ Tomatoes
  ├─ Carrots
  └─ Lettuce

🥩 Meat [2]
  ├─ Chicken breast
  └─ Ground beef

🧹 Cleaning [4]
  ├─ Bleach
  ├─ Soap
  ├─ Towels
  └─ Sponges
```

**You're done shopping for produce**, so:
- Click the "🥬 Produce" header
- The entire category collapses
- Focus on remaining aisles: Meat and Cleaning

### How to Collapse/Expand

1. **Click the category header** (anywhere on the header bar)
2. **The chevron icon (▼) rotates** to show collapse state
3. **Items hide/show** with smooth animation
4. **State resets** when you refresh or leave the page (no persistence yet)

## Reading Item Counts

### Understanding the Numbers

```
🥬 Produce  [3]  ✓2
```

- **[3]** = 3 items still to shop for (unchecked)
- **✓2** = 2 items already purchased (checked)
- **Total** = 5 items in this category

### Real-World Example

```
🧼 Hygiene [1] ✓4
```

This means:
- You have 4 items already checked off
- Only 1 more item needed from this aisle
- Great! Almost done with hygiene products

## Item Organization

### Default Category Order

Items are organized in this order:
1. 🥬 **Produce** - Fruits, vegetables
2. 🥛 **Dairy** - Milk, cheese, yogurt
3. 🥩 **Meat & Fish** - Poultry, beef, seafood
4. 🥖 **Bakery** - Bread, pastries, croissants
5. 🥫 **Pantry** - Rice, pasta, oil, spices
6. 🧊 **Frozen** - Ice cream, frozen foods
7. 🍫 **Snacks & Sweets** - Candy, chips, chocolate
8. 🥤 **Drinks** - Juice, soda, water, coffee
9. 🧹 **Cleaning & Home** - Detergent, bleach, paper products
10. 💊 **Pharma & Baby** - Diapers, shampoo, vitamins
11. 📦 **Other** - Unknown/uncategorized items

### How Items Are Matched

Each item is automatically matched to a category using keywords:

**Example: "תפוח אדום" (Red Apple)**
- Matches keyword "תפוח" → assigned to **Produce** 🥬

**Example: "עוף קפוא" (Frozen Chicken)**
- First keyword match: "עוף" (chicken) → **Meat** 🥩
- (The keyword match takes precedence; item goes to Meat, not Frozen)

**Example: "קרם רגליים בלתי ידוע" (Unknown foot cream)**
- No keyword match → assigned to **Other** 📦

## Interaction Examples

### Scenario 1: Regular Shopping Trip

```
Initial List (Smart Sort Enabled):
┌─────────────────────────┐
│ 🥬 Produce    [4]   ✓0  │  ← At produce aisle
│   Tomatoes              │
│   Carrots               │
│   Lettuce               │
│   Peppers               │
├─────────────────────────┤
│ 🥛 Dairy      [2]   ✓0  │  ← At dairy aisle
│   Milk                  │
│   Cheese                │
├─────────────────────────┤
│ 🥩 Meat       [1]   ✓0  │  ← At meat aisle
│   Chicken breast        │
└─────────────────────────┘

Step 1: You check off produce items
┌─────────────────────────┐
│ 🥬 Produce    [0]   ✓4  │  ← Collapse this!
│   ✓ Tomatoes  (strikethrough)
│   ✓ Carrots
│   ✓ Lettuce
│   ✓ Peppers
├─────────────────────────┤
│ 🥛 Dairy      [2]   ✓0  │  ← Focus here
│   Milk
│   Cheese
├─────────────────────────┤
│ 🥩 Meat       [1]   ✓0  │  ← Next
│   Chicken breast
└─────────────────────────┘

Step 2: Collapse produce
┌─────────────────────────┐
│ 🥬 Produce    [0]   ✓4  │  ← Collapsed (no items shown)
├─────────────────────────┤
│ 🥛 Dairy      [2]   ✓0  │  ← Focus here now
│   Milk
│   Cheese
├─────────────────────────┤
│ 🥩 Meat       [1]   ✓0  │  ← Next aisle
│   Chicken breast
└─────────────────────────┘
```

### Scenario 2: Large Shopping Trip

You have 47 items across all categories. By collapsing completed aisles, you reduce visual clutter:

```
Before Collapse:
- 11 categories visible
- 47 items displayed
- Hard to see what's left
- Visual noise

After Collapsing Completed (Produce, Dairy, Bakery):
- 8 categories visible (3 collapsed)
- 26 items displayed (21 hidden in collapsed sections)
- Clear focus on remaining aisles
- Much easier navigation!
```

## Mobile Experience

### On Small Screens
- Headers are optimized for touch
- Larger tap targets (easier to collapse)
- Text sizes adjust automatically
- Badges stack nicely on mobile

### Keyboard Navigation
- **Click** any header to collapse/expand
- **Use arrow keys** to navigate items (if implemented)
- **Enter** to select/check items

## Disabling Smart Sort

Want to go back to the flat list view?

1. Click the **"Smart Sort"** toggle
2. List reverts to simple chronological order
3. No grouping, no headers
4. All items in one flat list

## Tips & Tricks

### 🎯 Maximize Efficiency
1. **Sort by store layout**: The default order matches typical store layouts
2. **Work top-to-bottom**: Follow the category order for optimal routing
3. **Collapse as you go**: Hide completed aisles to stay focused
4. **Use checkmarks**: Check items off immediately for visual progress

### 💡 Pro Tips
- **Category not showing?** It probably has no items. Add some to see it.
- **Item in wrong category?** Edit the item name to use different keywords
- **Lots of items?** Collapse unnecessary categories to reduce screen space
- **Mobile users?** Sticky headers help you always see category name while scrolling

## Keyboard Shortcuts (If Applicable)

| Action | Keys |
|--------|------|
| Collapse/Expand Category | Click header or Space on focused header |
| Navigate Items | Arrow keys (if implemented) |
| Check Item Off | Space or Click checkbox |
| Delete Item | Delete key or Click trash icon |

## Accessibility Features

✓ **Color Contrast**: Headers and text meet WCAG AA standards
✓ **Icon + Text**: Every icon has text label (not just icon)
✓ **Touch Targets**: 44px minimum for mobile users
✓ **Screen Readers**: Semantic HTML structure
✓ **RTL Support**: Full right-to-left support for Hebrew
✓ **Language Toggle**: Switch between Hebrew and English anytime

## Troubleshooting

### "My list looks the same"
- **Check**: Is Smart Sort toggle enabled? (look for the pill-shaped button)
- **Fix**: Click the Smart Sort toggle to enable grouped view

### "Items in wrong categories"
- **Reason**: Automatic matching uses keyword detection
- **Fix**: Edit item name to include a different keyword
- **Example**: "Frozen Chicken" → write "Chicken" (matches Meat) instead of "Frozen" (would match Frozen)

### "Headers disappeared"
- **Reason**: You might have collapsed all categories
- **Fix**: Click headers to expand them again

### "List keeps reverting"
- **Note**: Collapse state resets on page refresh (feature will save state in future)
- **Workaround**: Use browser history to go back if needed

## What's Coming Next?

Future versions will include:
- 💾 **Save collapse preferences** - Remember which categories you collapsed
- 🔄 **Custom category order** - Drag to reorder categories
- 🔍 **Search within category** - Find items without expanding all
- 📊 **Category totals** - See total cost/quantity per aisle
- 👆 **Swipe gestures** - Mobile-specific shortcuts
- 🎨 **Custom colors** - Color-code categories by your preferences

## Need Help?

- Check the app's **About** section for more info
- Items in **Hebrew and English** are both supported
- Try toggling Smart Sort off/on if anything looks weird
- Refresh the page if you see rendering issues

---

**Happy shopping! 🛒**

The Grouped List View makes shopping faster, easier, and more organized!
