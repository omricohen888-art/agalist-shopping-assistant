
# עדכון דיאלוג "סיים קנייה" במסך הראשי - זהה למצב קניות חכם

## הבעיה
הדיאלוג שנפתח כשלוחצים "סיים קנייה" ממסך הפנקס הראשי הוא גרסה ישנה ופשוטה, בעוד שהדיאלוג במצב קניות חכם (ShoppingMode) כולל:
- בחירת **סוג קנייה** (סופרמרקט, אונליין, פארם, ביגוד וכו')
- בחירת **רשת/חנות** דינמית לפי סוג הקנייה
- **סיכום** מספר פריטים שהושלמו
- כפתור "שמור וסיים" בירוק

## פתרון
עדכון הדיאלוג ב-`src/components/ShoppingList.tsx` כך שיהיה זהה לדיאלוג של ShoppingMode.

### קובץ: `src/components/ShoppingList.tsx`

**1. הוספת imports חסרים:**
- ייבוא `SHOPPING_TYPES`, `STORES_BY_TYPE`, `ShoppingType` מ-`@/types/shopping` (כבר קיים חלקית, צריך להוסיף את השלושה)

**2. הוספת state חדש:**
```typescript
const [selectedShoppingType, setSelectedShoppingType] = useState<ShoppingType>("supermarket");
```

**3. עדכון `handleFinishShopping`:**
- שימוש ב-`selectedShoppingType` ב-history object שנשמר
- איפוס `selectedShoppingType` אחרי שמירה מוצלחת

**4. עדכון הדיאלוג (שורות 2627-2680):**
החלפת כל תוכן הדיאלוג הקיים לגרסה זהה לשל ShoppingMode, כולל:
- כותרת: "🛒 סיים קנייה" / "🛒 Finish Shopping"
- dropdown סוג קנייה עם אייקונים
- dropdown חנות דינמי לפי סוג (עם אפשרות הקלדה ידנית)
- שדה סכום
- תיבת סיכום פריטים (X מתוך Y הושלמו)
- כפתורי "ביטול" ו"שמור וסיים" (ירוק עם CheckCircle2)

**5. עדכון ה-store validation:**
הסרת הלוגיקה הישנה שמשתמשת ב-`otherLabel` / `customStore` ישן והחלפתה בלוגיקה של `__custom__` כמו ב-ShoppingMode

## סיכום שינויים
- **רק קובץ אחד** משתנה: `src/components/ShoppingList.tsx`
- הדיאלוג יהיה **זהה לחלוטין** לדיאלוג ב-ShoppingMode
- השמירה להיסטוריה **תכלול גם soppingType** כמו שקורה ב-ShoppingMode
