# Quick Reference Card - Grouped List View

## 🚀 Quick Start

### Enable Grouped View
1. Click **"Smart Sort"** toggle button
2. List reorganizes into category groups
3. Click any header to collapse/expand

### Understanding the Display
```
🥬 Produce    [3]    ✓2
 └─ Category Icon + Name | Pending items | Completed items
```

## 📊 Categories (11 Total)

| Icon | Category | Contains |
|------|----------|----------|
| 🥬 | Produce | Fruits, vegetables, salads |
| 🥛 | Dairy | Milk, cheese, yogurt, butter |
| 🥩 | Meat & Fish | Chicken, beef, seafood |
| 🥖 | Bakery | Bread, pastries, croissants |
| 🥫 | Pantry | Rice, pasta, oil, spices |
| 🧊 | Frozen | Ice cream, frozen foods |
| 🍫 | Snacks | Candy, chips, chocolate |
| 🥤 | Drinks | Juice, soda, coffee, water |
| 🧹 | Cleaning | Soap, detergent, bleach |
| 💊 | Pharma | Diapers, vitamins, medicine |
| 📦 | Other | Uncategorized items |

## 🔧 How It Works

### Automatic Categorization
```
Item Text Detection → Keyword Matching → Category Assignment
Example: "עוף קפוא" (Frozen Chicken)
  Detected keywords: "עוף" (highest priority)
  → Category: 🥩 Meat & Fish
```

### Header Interaction
```
Click Header
  ↓
Category Collapses/Expands
  ↓
Chevron Rotates (▼→◄)
  ↓
Items Show/Hide
```

## 💡 Use Cases

### Single Store Visit
1. ✅ Add all items
2. ✅ Enable Smart Sort
3. ✅ Follow category order through store
4. ✅ Collapse aisles as you finish them

### Multi-Store Shopping
1. ✅ View all needed items grouped
2. ✅ Collapse non-relevant categories
3. ✅ Focus on specific store's layout

### Large Lists
1. ✅ Reduce visual clutter
2. ✅ Hide completed categories
3. ✅ Stay focused on remaining items

## ⚙️ Configuration

### View Mode Toggle
- **Smart Sort ON** → Grouped view with headers
- **Smart Sort OFF** → Flat chronological list

### Collapse State
- **Per-category**: Click header to toggle
- **Session-based**: Resets on page refresh
- **Not saved**: (Feature for future update)

## 🎨 Visual Design

### Header Styling
```
Glass Effect: Semi-transparent with blur
Gradient: Subtle primary color overlay
Border: Subtle semi-transparent line
Shadow: Hover increases shadow depth
Colors: Matches theme (light/dark mode)
```

### Item Indentation
```
Category Header
  ├─ Item 1 (indented 8-16px)
  ├─ Item 2 (indented 8-16px)
  └─ Item 3 (indented 8-16px)
```

## 📱 Mobile Features

- **Touch-Friendly**: 44px+ tap targets
- **Responsive**: Adjusts for small screens
- **Optimized**: Readable text sizes
- **Haptic**: (Future feature)

## 🌍 Language Support

| Feature | Hebrew | English |
|---------|--------|---------|
| Category Names | ✓ | ✓ |
| Item Descriptions | ✓ | ✓ |
| UI Labels | ✓ | ✓ |
| Text Direction | RTL | LTR |
| Keywords | 150+ | 150+ |

## ⌨️ Keyboard Shortcuts

| Action | How |
|--------|-----|
| Collapse Category | Click header or Space key |
| Expand Category | Click header or Space key |
| Check Item | Space or Click checkbox |
| Delete Item | Click delete icon |
| Edit Quantity | Click quantity field |

## 🎯 Smart Matching Examples

### Good Matches
- "תפוח" → 🥬 Produce
- "חלב" → 🥛 Dairy
- "עוף" → 🥩 Meat
- "לחם" → 🥖 Bakery

### Complex Matches (Keyword Priority)
- "עוף קפוא" → 🥩 Meat (not 🧊 Frozen)
- "שוקולד" → 🍫 Snacks (not 🧊 Frozen)
- "עדשים יבשות" → 🥫 Pantry (not 🥬 Produce)

### Unknown Items
- Random text → 📦 Other
- Mixed language → 📦 Other
- New items → 📦 Other

## 🔄 View Switching

```
Grouped View (Smart Sort ON)
  Click toggle
    ↓
Flat View (Smart Sort OFF)
  Same items, chronological order
  Click toggle
    ↓
Back to Grouped View
  Items stay in same state
```

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| List looks flat | Enable Smart Sort toggle |
| Items in wrong category | Edit item name to use different keyword |
| Can't see items | Expand collapsed category (click header) |
| Headers not showing | You might have no items or all collapsed |
| Layout broken on mobile | Refresh page or clear browser cache |

## 📈 Performance Tips

✓ **Do**: Keep items organized by naturally available keywords
✓ **Do**: Use collapse feature for long shopping lists (50+ items)
✓ **Do**: Switch off Smart Sort if you prefer chronological order
✗ **Don't**: Add unnecessary prefixes to item names
✗ **Don't**: Create custom categories (use existing ones)
✗ **Don't**: Force items into wrong categories

## 🎁 Bonus Features

### Coming Soon
- 💾 Persist collapse preferences
- 🔄 Custom category order
- 🔍 Search within categories
- 📊 Category totals
- 👆 Swipe gestures
- 🎨 Custom colors

## 📞 Support

### Common Questions

**Q: Where's the category header?**
A: Enable Smart Sort from the toggle button

**Q: How are items categorized?**
A: Automatic keyword detection from 300+ term database

**Q: Can I change categories?**
A: Yes! Edit item name to use different keyword

**Q: Does it save my collapse state?**
A: Not yet - future feature (currently session-based)

**Q: How many categories?**
A: 11 categories covering all common items

**Q: Mobile friendly?**
A: Yes! Fully responsive and touch-optimized

## 🔗 Related Features

- **Smart Sort Toggle**: Enable/disable grouped view
- **Sort Mode Toggle**: Alternative sorting modes
- **Search**: Find specific items
- **History**: View past shopping trips
- **Favorites**: Quick-start templates

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Categories | 11 |
| Keywords | 300+ |
| Languages | 2 (He, En) |
| Components | 2 new |
| File Size Impact | +7KB (minified) |
| Performance Impact | Minimal (O(n)) |
| Browser Support | Modern (90%+) |

## 🎓 Learning Resources

1. **User Guide**: `GROUPED_LIST_USER_GUIDE.md`
2. **Technical Docs**: `GROUPED_LIST_TECHNICAL_REFERENCE.md`
3. **Implementation**: `GROUPED_LIST_IMPLEMENTATION.md`
4. **This Card**: Quick reference only

---

**Version**: 1.0.0  
**Updated**: December 6, 2025  
**Status**: Production Ready ✓
