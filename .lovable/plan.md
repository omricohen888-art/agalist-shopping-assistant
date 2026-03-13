

# הקטנת הלוגו בהדר

## מצב נוכחי
הלוגו (SVG checkbox) הוא `h-8 w-8 sm:h-10 sm:w-10` והטקסט "עגליסט" הוא `text-2xl sm:text-3xl font-bold`.

## שינוי מוצע
ב-`src/components/ShoppingList.tsx`:

1. **אייקון הלוגו (שורה 1714)**: הקטנה מ-`h-8 w-8 sm:h-10 sm:w-10` ל-`h-6 w-6 sm:h-8 sm:w-8`
2. **טקסט "עגליסט" (שורה 1739)**: הקטנה מ-`text-2xl sm:text-3xl` ל-`text-xl sm:text-2xl`

זה יתן לוגו מידתי יותר שלא ידחוק את שאר האלמנטים בהדר ולא ייחתך במכשירים עם Dynamic Island.

