
# תוכנית: הכנת הפרויקט ל-Vercel + Supabase

## סקירה כללית

נכין את הפרויקט לפריסה ב-Vercel (אירוח) עם חיבור ל-Supabase (מסד נתונים ואימות משתמשים עם Google).

## מה נעשה

```text
┌─────────────────────────────────────────────────────────────┐
│                    מבנה הפרויקט החדש                        │
├─────────────────────────────────────────────────────────────┤
│  Vercel (אירוח)                                             │
│  ├── React App (Frontend)                                   │
│  └── Environment Variables                                  │
│                                                             │
│  Supabase (Backend)                                         │
│  ├── Database (PostgreSQL)                                  │
│  ├── Authentication (Google OAuth)                          │
│  └── Row Level Security                                     │
└─────────────────────────────────────────────────────────────┘
```

## שלבי ההכנה

### שלב 1: יצירת קבצי קונפיגורציה ל-Vercel

**קובץ חדש: `vercel.json`**
קונפיגורציה לפריסה ב-Vercel עם תמיכה ב-SPA routing:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### שלב 2: הוספת Supabase Client

**תלות חדשה:**
```bash
npm install @supabase/supabase-js
```

**קבצים חדשים:**

1. `src/integrations/supabase/client.ts` - לקוח Supabase
2. `src/integrations/supabase/types.ts` - טיפוסים לטבלאות

### שלב 3: יצירת AuthContext

**קובץ חדש: `src/context/AuthContext.tsx`**

Context לניהול מצב ההתחברות עם:
- התחברות/התנתקות עם Google
- שמירת מצב המשתמש
- Hook נוח לשימוש (`useAuth`)

### שלב 4: עדכון Environment Variables

**קובץ חדש: `.env.example`** (לתיעוד)
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

הערה: הקובץ `.env` עצמו לא יישמר בגיט, אלא יוגדר ב-Vercel.

### שלב 5: יצירת דף Auth

**קובץ חדש: `src/pages/Auth.tsx`**

דף התחברות יפה עם:
- כפתור "התחבר עם Google"
- עיצוב תואם לאפליקציה (RTL, צבעים)
- הפניה אוטומטית אחרי התחברות

### שלב 6: עדכון App.tsx

- הוספת `AuthProvider` לעטוף את האפליקציה
- הוספת Route לדף `/auth`
- הגנה על routes שדורשים התחברות (אופציונלי)

### שלב 7: עדכון Navigation

- הצגת תמונת פרופיל Google כשמחובר
- כפתור "התנתק" במקום "החשבון שלי"
- כפתור "התחבר" כשלא מחובר

## פרטים טכניים

### מבנה הקבצים החדש
```text
project/
├── vercel.json (חדש)
├── .env.example (חדש)
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx (חדש)
│   │   └── LanguageContext.tsx
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts (חדש)
│   │       └── types.ts (חדש)
│   ├── pages/
│   │   ├── Auth.tsx (חדש)
│   │   └── ...
│   └── ...
└── ...
```

### Supabase Client Implementation
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### AuthContext Structure
```typescript
// src/context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

## מה תצטרך לעשות (לא בקוד)

### בצד Supabase:
1. ליצור פרויקט חדש ב-supabase.com
2. להעתיק את ה-URL וה-Anon Key
3. להגדיר Google OAuth:
   - להפעיל Google Provider ב-Authentication → Providers
   - ליצור פרויקט ב-Google Cloud Console
   - להזין Client ID ו-Secret
4. להגדיר Site URL וRedirect URLs:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app`, `http://localhost:5173`

### בצד Vercel:
1. לחבר את ה-GitHub Repository
2. להוסיף Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. לפרוס (Deploy)

### בצד Google Cloud:
1. ליצור פרויקט חדש
2. להפעיל OAuth consent screen
3. ליצור OAuth 2.0 credentials
4. להוסיף Authorized redirect URIs מ-Supabase

## שלב הבא - מסד נתונים

אחרי שההתחברות תעבוד, נוסיף:
1. טבלאות ל-profiles, saved_lists, shopping_history
2. RLS policies לאבטחה
3. עדכון storage.ts לסנכרון עם Supabase

## סיכום השינויים

| קובץ | פעולה | תיאור |
|------|-------|-------|
| `vercel.json` | חדש | קונפיגורציה לפריסה |
| `.env.example` | חדש | תיעוד משתני סביבה |
| `src/integrations/supabase/client.ts` | חדש | לקוח Supabase |
| `src/integrations/supabase/types.ts` | חדש | טיפוסים |
| `src/context/AuthContext.tsx` | חדש | ניהול התחברות |
| `src/pages/Auth.tsx` | חדש | דף התחברות |
| `src/App.tsx` | עדכון | הוספת AuthProvider ו-Route |
| `src/components/Navigation.tsx` | עדכון | כפתור התחבר/התנתק |
| `package.json` | עדכון | הוספת @supabase/supabase-js |
