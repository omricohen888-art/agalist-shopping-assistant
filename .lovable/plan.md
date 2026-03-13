

# תיקון התאמת החלק העליון לאייפון 14+

## הבעיה
ההדר העליון (sticky header) מתחיל ב-`top-0` בלי להתחשב ב-safe area של אייפון 14 ומעלה (Dynamic Island / notch). כתוצאה הלוגו והכפתורים נחתכים מלמעלה.

## הפתרון
הוספת `padding-top` שמתחשב ב-`env(safe-area-inset-top)` להדר הדביק, כדי שהתוכן ייתחיל מתחת ל-Dynamic Island/notch.

## שינויים טכניים

### `src/components/ShoppingList.tsx`
- **שורה 1704** — להדר הדביק, להוסיף `pt-[env(safe-area-inset-top)]` כדי שירד מתחת לאזור ה-notch/Dynamic Island.

### `src/index.css`
- הוספת utility class `safe-top` עם `padding-top: env(safe-area-inset-top, 0px)` למקרה שנצטרך לשימוש חוזר.

### `index.html`
- כבר יש `viewport-fit=cover` ו-`apple-mobile-web-app-status-bar-style: black-translucent` — אלה נדרשים כדי ש-`env(safe-area-inset-top)` יעבוד, וזה כבר במקום.

