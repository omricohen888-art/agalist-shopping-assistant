
## הוספת אפשרות מחיקת פריטים במצב קניות

### הבעיה
במצב קניות אינטראקטיבי אין אפשרות להסיר פריטים מהרשימה - לא כפתור מחיקה ולא החלקה.

### הפתרון המוצע
הוספת כפתור פח אשפה (Trash) לכל פריט ברשימה - גם לפריטים פעילים וגם לפריטים שנאספו.

---

### שינויים טכניים

#### 1. הוספת פונקציית מחיקה ואייקון
**קובץ:** `src/pages/ShoppingMode.tsx`

**שורה 8 - הוספת אייקון Trash:**
```tsx
import { 
  ArrowRight, CheckCircle2, Home, X, Check, Sparkles, 
  Trophy, Zap, Star, PartyPopper, ShoppingCart, Timer, Store,
  Plus, ClipboardPaste, Clock, Pin, PinOff, Trash2
} from "lucide-react";
```

#### 2. הוספת פונקציית מחיקה (אחרי togglePin, בערך שורה 338)
```tsx
const deleteItem = (itemId: string, e: React.MouseEvent) => {
  e.stopPropagation();
  setItems(prev => prev.filter(item => item.id !== itemId));
  lightTap();
  toast.success(language === 'he' ? 'פריט הוסר' : 'Item removed');
};
```

#### 3. הוספת כפתור מחיקה לפריטים פעילים (renderItem, שורות 394-415)
**לפני:** רק כפתור Pin
**אחרי:** כפתור Pin + כפתור Trash

```tsx
{/* Pin button */}
<button onClick={(e) => togglePin(item.id, e)} ... >
  ...
</button>

{/* Delete button - חדש! */}
<button
  onClick={(e) => deleteItem(item.id, e)}
  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
    border transition-all duration-200 touch-manipulation active:scale-90
    bg-muted border-border text-muted-foreground 
    hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
  title={language === 'he' ? 'הסר פריט' : 'Remove item'}
>
  <Trash2 className="h-4 w-4" />
</button>
```

#### 4. הוספת כפתור מחיקה לפריטים שנאספו (שורות 784-816)
**לפני:** רק checkbox ותוכן
**אחרי:** checkbox, תוכן, וכפתור Trash

```tsx
{/* Completed item with delete button */}
<div className="flex items-center gap-2">
  <button onClick={() => toggleItem(item.id)} className="flex-1 ...">
    {/* תוכן הפריט הקיים */}
  </button>
  
  {/* כפתור מחיקה */}
  <button
    onClick={(e) => deleteItem(item.id, e)}
    className="flex-shrink-0 w-8 h-8 rounded-lg ..."
  >
    <Trash2 className="h-4 w-4" />
  </button>
</div>
```

---

### סיכום השינויים

| מיקום | שינוי |
|-------|-------|
| Import | הוספת `Trash2` מ-lucide-react |
| פונקציה חדשה | `deleteItem(id, e)` - מסיר פריט מהרשימה |
| פריטים פעילים | כפתור פח ליד כפתור הנעיצה |
| פריטים שנאספו | כפתור פח קטן בקצה הפריט |

### מראה צפוי
```text
┌────────────────────────────────────────┐
│ ☐  חלב   1 יח'      [📌] [🗑️]       │
│ ☐  לחם   2 יח'      [📌] [🗑️]       │
└────────────────────────────────────────┘

נאספו:
┌────────────────────────────────────────┐
│ ✓  ביצים  1 יח'              [🗑️]   │
└────────────────────────────────────────┘
```

### תוצאה
- כל פריט יכלול כפתור מחיקה ברור ונגיש
- לחיצה על הכפתור תסיר מיידית את הפריט
- הודעת toast תאשר את המחיקה
- פידבק haptic על המחיקה
