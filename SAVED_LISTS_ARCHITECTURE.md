# Saved Lists Split Actions - Visual Architecture

## User Flow Diagrams

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD                                │
│                    (Saved Lists View)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │ Edit Button  │    │ Shop Button  │
            │   (Pencil)   │    │(ShoppingCart)│
            └──────────────┘    └──────────────┘
                    │                   │
         ┌──────────▼──────────┐    ┌───▼──────────────────┐
         │  handleEditList()   │    │ handleQuickShop()    │
         └──────────┬──────────┘    └────┬─────────────────┘
                    │                    │
        ┌───────────┴────────────┐   ┌───┴──────────────────┐
        ▼                        ▼   ▼                      ▼
   setItems()            setActiveListId()    navigate('/shopping-mode')
   setActiveListId()     setListName()        setItems()
   setListName()         Toast notification   setActiveListId()
   Toast notification    (stay on Dashboard)  setListName()
        │
        ▼
   NOTEPAD LOADS
   (Same Dashboard view)
        │
        ├─ User can:
        │  ├─ Add more items
        │  ├─ Edit quantities
        │  ├─ Remove items
        │  └─ Start shopping when ready
        │
        └─ No page navigation

                                        │
                                        ▼
                                  SHOPPING MODE
                                   (New page)
                                        │
                                        ├─ User can:
                                        │  ├─ Check items off
                                        │  ├─ Add store
                                        │  ├─ Record total
                                        │  └─ Complete trip
                                        │
                                        └─ Full shopping experience
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ShoppingList.tsx                         │
│                  (Main Component)                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  State:                                                      │
│  ├─ items: ShoppingItem[]                                   │
│  ├─ activeListId: string | null                             │
│  ├─ listName: string                                        │
│  └─ ...other states...                                      │
│                                                              │
│  Handlers:                                                   │
│  ├─ handleLoadList(list) - Legacy                           │
│  ├─ handleEditList(list) - NEW ✨                           │
│  └─ handleQuickShop(list) - NEW ✨                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Saved Lists Section (renderSavedLists)                │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  SavedListCard (Multiple instances)              │  │ │
│  │  │                                                  │  │ │
│  │  │  Props:                                          │  │ │
│  │  │  ├─ list: SavedList                              │  │ │
│  │  │  ├─ onLoad={handleLoadList}                      │  │ │
│  │  │  ├─ onEdit={handleEditList} ✨                   │  │ │
│  │  │  ├─ onDelete={...}                               │  │ │
│  │  │  ├─ onToggleItem={...}                           │  │ │
│  │  │  └─ onQuickShop={handleQuickShop} ✨             │  │ │
│  │  │                                                  │  │ │
│  │  │  ┌──────────────────────────────────────────┐   │  │ │
│  │  │  │  Footer Action Bar (NEW)                 │   │  │ │
│  │  │  │  ┌─────────────────────────────────────┐ │   │  │ │
│  │  │  │  │ Date  [✏️ Edit] [🛒 Shop]            │ │   │  │ │
│  │  │  │  └─────────────────────────────────────┘ │   │  │ │
│  │  │  └──────────────────────────────────────────┘   │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
SavedList Data
      │
      ├─ SavedListCard Component
      │  │
      │  ├─ Renders list items
      │  ├─ Displays metadata
      │  │
      │  └─ Footer with Buttons
      │     │
      │     ├─ Edit Button
      │     │  │
      │     │  └─ onClick → e.stopPropagation()
      │     │     │
      │     │     ├─ if (onEdit)
      │     │     │  └─ onEdit(list)
      │     │     │     │
      │     │     │     └─ Parent: handleEditList
      │     │     │        │
      │     │     │        ├─ setItems([...list.items])
      │     │     │        ├─ setActiveListId(list.id)
      │     │     │        ├─ setListName(list.name)
      │     │     │        └─ toast.success(...)
      │     │     │           │
      │     │     │           └─ Dashboard Re-renders
      │     │     │              │
      │     │     │              └─ Notepad becomes visible
      │     │     │                 (edit mode activated)
      │     │     │
      │     │     └─ else (fallback)
      │     │        └─ onLoad(list)
      │     │
      │     └─ Shop Now Button
      │        │
      │        └─ onClick → e.stopPropagation()
      │           │
      │           └─ onQuickShop(list)
      │              │
      │              └─ Parent: handleQuickShop
      │                 │
      │                 ├─ setItems([...list.items])
      │                 ├─ setActiveListId(list.id)
      │                 ├─ setListName(list.name)
      │                 │
      │                 └─ navigate('/shopping-mode', {
      │                    state: {
      │                      items: list.items,
      │                      listId: list.id,
      │                      listName: list.name
      │                    }
      │                  })
      │                    │
      │                    └─ ShoppingMode Component
      │                       │
      │                       ├─ Reads state from location
      │                       ├─ Displays shopping interface
      │                       └─ User can checkout items
```

## State Management

### Edit Workflow State

```
BEFORE:
┌─────────────────────┐
│ items: []           │
│ activeListId: null  │
│ listName: ""        │
└─────────────────────┘

User clicks Edit
        ↓

DURING:
┌──────────────────────────────────────────┐
│ items: [item1, item2, item3]             │
│ activeListId: "list-123"                 │
│ listName: "My Grocery List"              │
└──────────────────────────────────────────┘
                ↓
        Notepad visible
        User can edit
                ↓

AFTER:
Same state, but with modifications
from user editing
```

### Shop Workflow State

```
BEFORE:
┌─────────────────────┐
│ items: []           │
│ activeListId: null  │
│ listName: ""        │
└─────────────────────┘

User clicks Shop Now
        ↓

DURING:
1. State updates:
┌──────────────────────────────────────────┐
│ items: [item1, item2, item3]             │
│ activeListId: "list-123"                 │
│ listName: "My Grocery List"              │
└──────────────────────────────────────────┘

2. Navigation triggers:
navigate('/shopping-mode', {
  state: {
    items: [...],
    listId: 'list-123',
    listName: 'My Grocery List'
  }
})
        ↓

AFTER:
ShoppingMode Component loads
with the passed state
```

## Routing Diagram

```
DASHBOARD ROUTE
    │
    ├─ SavedListCard.tsx
    │  ├─ Edit Button
    │  │  └─ handleEditList()
    │  │     └─ setItems, setActiveListId
    │  │        └─ ✅ STAY ON /
    │  │
    │  └─ Shop Button
    │     └─ handleQuickShop()
    │        └─ navigate('/shopping-mode', { state })
    │           └─ ✅ GO TO /shopping-mode
    │
    └─ Conditional Rendering
       ├─ If activeListId → Notepad visible
       └─ If not → Normal dashboard
```

## Button Component Tree

```
SavedListCard
  └─ Footer Section
     └─ Action Bar Container (flex)
        ├─ Date Span
        │  └─ Formatted date
        │
        └─ Action Buttons Container (flex)
           ├─ Edit Button (Always)
           │  ├─ Pencil Icon
           │  ├─ "Edit" Text (hidden on mobile)
           │  └─ onClick → onEdit
           │
           └─ Shop Now Button (Conditional)
              ├─ ShoppingCart Icon
              ├─ "Shop" Text (hidden on mobile)
              └─ onClick → onQuickShop
                 (only if onQuickShop provided)
```

## Responsive Behavior

### Mobile (<640px)
```
┌─────────────────┐
│ Date  [✏️][🛒]  │
│                 │
│ All in one row  │
│ Icons visible   │
│ Text hidden     │
└─────────────────┘
```

### Desktop (≥640px)
```
┌────────────────────────────────┐
│ Date  [✏️ Edit]  [🛒 Shop Now] │
│                                │
│ Comfortable spacing            │
│ Icons + text visible           │
│ Full clarity                   │
└────────────────────────────────┘
```

## Event Flow

```
User Action
    │
    ├─ Click Edit Button
    │  └─ e.stopPropagation()
    │     └─ if (onEdit)
    │        └─ onEdit(list)
    │           └─ Parent handler receives list
    │              └─ handleEditList executes
    │                 └─ State updates
    │                    └─ UI re-renders (Notepad visible)
    │
    └─ Click Shop Button
       └─ e.stopPropagation()
          └─ onQuickShop(list)
             └─ Parent handler receives list
                └─ handleQuickShop executes
                   ├─ State updates
                   └─ navigate() triggers
                      └─ Route changes to /shopping-mode
```

## Styling Hierarchy

```
SavedListCard
  └─ Footer Section
     ├─ Styling:
     │  ├─ mt-3 sm:mt-4 (margin-top)
     │  ├─ pt-2.5 sm:pt-3 (padding-top)
     │  ├─ border-t-2 (top border)
     │  └─ border-black/5 dark:border-white/5
     │
     └─ Flex Container
        ├─ Styling:
        │  ├─ flex items-center justify-between
        │  └─ gap-2
        │
        ├─ Date (left)
        │  └─ text-[8px] sm:text-xs
        │
        └─ Button Container (right)
           ├─ Styling:
           │  ├─ flex items-center gap-2
           │  ├─ flex-1 justify-end
           │  └─ Grows to fill space
           │
           ├─ Edit Button
           │  ├─ Outline variant
           │  ├─ h-8 sm:h-9
           │  ├─ px-3 sm:px-4
           │  └─ border-gray-300 dark:border-slate-600
           │
           └─ Shop Button
              ├─ Gradient variant
              ├─ h-8 sm:h-9
              ├─ px-3 sm:px-4
              └─ from-yellow-400 to-orange-400
```

## Timeline

```
User opens Dashboard
    ↓
SavedLists loaded
    ↓
SavedListCard rendered (for each list)
    ↓
Edit & Shop buttons visible
    ↓
User clicks button
    ↓
Handler executes (Edit or Shop)
    ↓
─────┬────────────────┬─────────
     │                │
EDIT │          SHOP  │
     │                │
List loaded    Navigate to
in Notepad     Shopping Mode
     │                │
     └─ Stay on   ┌───┴───────
       Dashboard   │ Different
                   │ Component
                   │ Different
                   │ View
```

## Integration Points

```
┌─────────────────────────────────────────────────────┐
│              ShoppingList.tsx                       │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  handleEditList - NEW INTEGRATION           │  │
│  │  Purpose: Edit existing saved list          │  │
│  │  Calls: setItems, setActiveListId, etc.     │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  handleQuickShop - NEW INTEGRATION           │  │
│  │  Purpose: Quick navigate to shopping         │  │
│  │  Calls: navigate('/shopping-mode', ...)      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  SavedListCard Props Update                  │  │
│  │  New props: onEdit, onQuickShop              │  │
│  │  Passed handlers: handleEditList,            │  │
│  │                  handleQuickShop             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
┌──────────▼──────────────────────┐  ┌──────────▼────────────────┐
│ Notepad Component                │  │ ShoppingMode Component     │
│ ┌────────────────────────────┐   │  │ ┌────────────────────────┐ │
│ │ Shows when activeListId    │   │  │ │ Shows when navigated   │ │
│ │ Allows editing             │   │  │ │ Full shopping UX       │ │
│ │ Items from Edit workflow   │   │  │ │ Items from Shop flow   │ │
│ └────────────────────────────┘   │  │ └────────────────────────┘ │
└────────────────────────────────────┘  └────────────────────────────┘
```

---

**Last Updated**: December 7, 2025
**Status**: Complete & Production Ready ✅
