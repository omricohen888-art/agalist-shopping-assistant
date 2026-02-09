

# הוספת עריכת קניות שהושלמו (היסטוריה)

## מה ישתנה
כרגע, כרטיסי "קניות שהושלמו" מציגים מידע לקריאה בלבד (שם חנות, סכום, תאריך, פריטים). התכנית היא להוסיף אפשרות עריכה לכל השדות האלו - גם למשתמש אורח (localStorage) וגם למשתמש מחובר (Supabase).

## שינויים מתוכננים

### 1. פונקציות עדכון בשכבת הנתונים
- **storage.ts** - הוספת פונקציית `updateShoppingHistory` ל-localStorage
- **cloudStorage.ts** - הוספת פונקציית `cloudUpdateShoppingHistory` עם Supabase UPDATE
- **use-cloud-sync.ts** - הוספת `updateShoppingHistory` שמנתבת בין cloud/local לפי מצב ההתחברות

### 2. מודל עריכה חדש - EditHistoryModal
קומפוננטה חדשה `EditHistoryModal.tsx` שתכלול:
- שדה לעריכת שם החנות (עם autocomplete מרשימת החנויות הקיימת)
- שדה לעריכת הסכום הכולל
- שדה לעריכת התאריך
- אפשרות לעריכת סוג הקנייה (shoppingType)
- כפתורי שמירה וביטול

### 3. כפתור עריכה בכרטיס
- הוספת כפתור עריכה (אייקון עיפרון) ב-`CompletedTripCard` ליד כפתור המחיקה בפוטר
- הוספת כפתור עריכה גם ב-`HistoryDetailModal` (מודל הצפייה בפרטים)

### 4. חיבור ב-ShoppingList
- העברת `onEdit` callback ל-CompletedTripCard
- ניהול state של המודל (פתיחה/סגירה, הטריפ הנערך)
- קריאה ל-`updateShoppingHistory` ורענון הרשימה לאחר שמירה

## פרטים טכניים

### קובצי עבודה:
1. `src/utils/storage.ts` - הוספת updateShoppingHistory
2. `src/utils/cloudStorage.ts` - הוספת cloudUpdateShoppingHistory
3. `src/hooks/use-cloud-sync.ts` - הוספת updateShoppingHistory
4. `src/components/EditHistoryModal.tsx` - קומפוננטה חדשה
5. `src/components/CompletedTripCard.tsx` - הוספת כפתור עריכה
6. `src/components/HistoryDetailModal.tsx` - הוספת כפתור עריכה
7. `src/components/ShoppingList.tsx` - חיבור המודל והלוגיקה
8. `src/pages/History.tsx` - חיבור עריכה גם בדף ההיסטוריה

### שדות הניתנים לעריכה בטריפ (ShoppingHistory):
- `store` - שם החנות
- `totalAmount` - סכום כולל
- `date` - תאריך
- `shoppingType` - סוג הקנייה
- `listName` - שם הרשימה
