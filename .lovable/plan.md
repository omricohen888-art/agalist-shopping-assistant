

# תיקון: נתוני היסטוריה לא מגיעים לדף התובנות

## הבעיה
דף התובנות (`Insights.tsx`) קורא נתונים רק מ-localStorage באמצעות `getShoppingHistory()`. משתמשים מחוברים דרך גוגל שומרים את הנתונים ב-Supabase, ולכן דף התובנות ריק עבורם.

## הפתרון
להחליף את הקריאה הישירה ל-localStorage בשימוש ב-hook `useCloudSync` שכבר קיים באפליקציה ומנתב אוטומטית בין localStorage (אורחים) ל-Supabase (מחוברים).

## שינויים בקובץ `src/pages/Insights.tsx`:

1. **הוספת import** ל-`useCloudSync` במקום `getShoppingHistory`
2. **שימוש ב-hook**: קריאה ל-`useCloudSync()` בגוף הקומפוננטה
3. **עדכון useEffect**: החלפת `getShoppingHistory()` ב-`cloudSync.getShoppingHistory()` (שהיא async) עם `await`

### לפני:
```text
import { getShoppingHistory } from "@/utils/storage";
...
useEffect(() => {
  setHistory(getShoppingHistory());
  ...
}, []);
```

### אחרי:
```text
import { useCloudSync } from "@/hooks/use-cloud-sync";
...
const { getShoppingHistory } = useCloudSync();

useEffect(() => {
  const loadHistory = async () => {
    const data = await getShoppingHistory();
    setHistory(data);
  };
  loadHistory();
  ...
}, [getShoppingHistory]);
```

## קובץ אחד בלבד ישתנה:
- `src/pages/Insights.tsx` - 3 שורות עיקריות
