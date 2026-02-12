
# תיקון תצוגת פריטים במיון חכם ובתצוגה רגילה

## 3 בעיות לתיקון:

### 1. כפתורי כמות (QuantityControl) - גדולים מדי בתוך השורות
הקומפוננטה `QuantityControl` מקבלת prop בשם `compact` אבל **לא משתמשת בו כלל**. הכפתורים תמיד w-10 h-10 (40px) - גדולים מדי לשורות הפנקס.

**תיקון ב-`src/components/QuantityControl.tsx`:**
- להשתמש ב-prop `compact` כדי לכווץ את הכפתורים ל-w-7 h-7 (28px) ואת הגאפ בין האלמנטים
- להקטין את האייקונים בתוך הכפתורים במצב compact
- להקטין את הטקסט של הכמות

### 2. אייקון הפח (Trash) - גדול ולא אלגנטי
במקום כפתור פח אדום גדול ובולט, להחליף לפתרון עדין יותר:
- במצב compact: כפתור קטן יותר (w-7 h-7) עם אייקון קטן
- צבע רקע עדין יותר (red-100 עם אייקון red-500) במקום רקע אדום מלא

### 3. צ'קבוקסים - קטנים ועגולים, צריכים להיות גדולים ומרובעים
הצ'קבוקסים בשני המקומות (grouped view שורה 1491, flat view שורה 2031) משתמשים ב-`h-5 w-5` שזה קטן.

**תיקון ב-`src/components/ShoppingList.tsx`:**
- להחליף `className="h-5 w-5 flex-shrink-0"` ל-`size="lg" className="rounded-md flex-shrink-0"` (h-8 w-8, מרובע)
- הצ'קבוקס כבר תומך ב-`rounded-lg` כברירת מחדל, נוסיף `rounded-md` לריבוע בולט יותר

## פרטים טכניים

### קבצים שישתנו:

**`src/components/QuantityControl.tsx`** - שימוש ב-prop `compact`:
- כפתורים: `w-10 h-10` -> `w-7 h-7` (compact)
- אייקונים: `w-5 h-5` -> `w-3.5 h-3.5` (compact)
- gap: `gap-4` -> `gap-2` (compact)
- טקסט כמות: `text-lg` -> `text-sm` (compact)
- כפתור פח: רקע עדין יותר (bg-red-100 text-red-500 במקום bg-red-500 text-white)

**`src/components/ShoppingList.tsx`** - 2 מקומות (שורות ~1488-1491 ו-~2031):
- הגדלת הצ'קבוקסים ל-`size="lg"` עם `rounded-md`
