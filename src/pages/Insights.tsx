import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  Wallet,
  ShoppingBag,
  Store,
  Edit2,
  Check,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getShoppingHistory } from "@/utils/storage";
import { ShoppingHistory } from "@/types/shopping";
import { useGlobalLanguage, Language } from "@/context/LanguageContext";

const BUDGET_KEY = "monthly_budget";

const translations: Record<Language, {
  title: string;
  subtitle: string;
  back: string;
  thisMonth: string;
  budget: {
    title: string;
    set: string;
    placeholder: string;
    spent: string;
    left: string;
    over: string;
    good: string;
    warning: string;
  };
  stats: {
    trips: string;
    avgTrip: string;
    topStore: string;
  };
  tips: {
    title: string;
    show: string;
    hide: string;
  };
  stores: {
    title: string;
  };
  trend: {
    up: string;
    down: string;
    same: string;
  };
  empty: {
    title: string;
    desc: string;
    cta: string;
  };
}> = {
  he: {
    title: "תובנות",
    subtitle: "סיכום ההוצאות שלך",
    back: "חזרה",
    thisMonth: "החודש",
    budget: {
      title: "תקציב חודשי",
      set: "הגדר",
      placeholder: "סכום בש״ח",
      spent: "הוצאת",
      left: "נותר",
      over: "חריגה",
      good: "במסלול",
      warning: "קרוב לגבול",
    },
    stats: {
      trips: "קניות",
      avgTrip: "ממוצע לקנייה",
      topStore: "החנות המובילה",
    },
    tips: {
      title: "טיפים לחיסכון",
      show: "הצג טיפים",
      hide: "הסתר",
    },
    stores: {
      title: "הוצאות לפי חנות",
    },
    trend: {
      up: "עלייה",
      down: "ירידה",
      same: "ללא שינוי",
    },
    empty: {
      title: "אין נתונים",
      desc: "סיים קניות כדי לראות תובנות",
      cta: "חזרה לרשימה",
    },
  },
  en: {
    title: "Insights",
    subtitle: "Your spending summary",
    back: "Back",
    thisMonth: "This Month",
    budget: {
      title: "Monthly Budget",
      set: "Set",
      placeholder: "Amount in ₪",
      spent: "Spent",
      left: "Left",
      over: "Over",
      good: "On Track",
      warning: "Near Limit",
    },
    stats: {
      trips: "Trips",
      avgTrip: "Avg per trip",
      topStore: "Top Store",
    },
    tips: {
      title: "Saving Tips",
      show: "Show tips",
      hide: "Hide",
    },
    stores: {
      title: "Spending by Store",
    },
    trend: {
      up: "increase",
      down: "decrease",
      same: "no change",
    },
    empty: {
      title: "No data yet",
      desc: "Complete shopping trips to see insights",
      cta: "Back to list",
    },
  },
};

const Insights = () => {
  const navigate = useNavigate();
  const { language } = useGlobalLanguage();
  const t = translations[language];
  const direction = language === "he" ? "rtl" : "ltr";

  const [history, setHistory] = useState<ShoppingHistory[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    setHistory(getShoppingHistory());
    const saved = localStorage.getItem(BUDGET_KEY);
    if (saved) setBudget(parseFloat(saved));
  }, []);

  // Current month data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyData = useMemo(() => {
    const thisMonth = history.filter(item => {
      const date = new Date(item.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const lastMonth = history.filter(item => {
      const date = new Date(item.date);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    const thisMonthTotal = thisMonth.reduce((sum, item) => sum + item.totalAmount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, item) => sum + item.totalAmount, 0);
    const change = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    return {
      total: thisMonthTotal,
      trips: thisMonth.length,
      average: thisMonth.length > 0 ? thisMonthTotal / thisMonth.length : 0,
      change,
      changeDirection: change > 5 ? 'up' : change < -5 ? 'down' : 'same',
    };
  }, [history, currentMonth, currentYear]);

  // Store breakdown
  const storeData = useMemo(() => {
    const stores: Record<string, number> = {};
    history.forEach(item => {
      const store = item.store || (language === 'he' ? 'לא צוין' : 'Unknown');
      stores[store] = (stores[store] || 0) + item.totalAmount;
    });
    return Object.entries(stores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [history, language]);

  const topStore = storeData.length > 0 ? storeData[0][0] : null;
  const totalAllTime = history.reduce((sum, item) => sum + item.totalAmount, 0);

  // Tips generation
  const tips = useMemo(() => {
    const result: string[] = [];
    
    if (budget && monthlyData.total > budget) {
      result.push(language === 'he' 
        ? `⚠️ חרגת מהתקציב ב-₪${(monthlyData.total - budget).toFixed(0)}`
        : `⚠️ Over budget by ₪${(monthlyData.total - budget).toFixed(0)}`);
    }
    
    if (monthlyData.changeDirection === 'up' && monthlyData.change > 20) {
      result.push(language === 'he'
        ? `📈 ההוצאות עלו ב-${monthlyData.change.toFixed(0)}% מהחודש הקודם`
        : `📈 Spending up ${monthlyData.change.toFixed(0)}% from last month`);
    }
    
    if (monthlyData.changeDirection === 'down') {
      result.push(language === 'he'
        ? `🎉 כל הכבוד! חסכת ${Math.abs(monthlyData.change).toFixed(0)}% מהחודש הקודם`
        : `🎉 Great! Saved ${Math.abs(monthlyData.change).toFixed(0)}% from last month`);
    }

    if (storeData.length > 1) {
      const [topStoreName, topAmount] = storeData[0];
      const percentage = totalAllTime > 0 ? (topAmount / totalAllTime * 100).toFixed(0) : 0;
      result.push(language === 'he'
        ? `🏪 ${percentage}% מההוצאות שלך ב${topStoreName}`
        : `🏪 ${percentage}% of spending at ${topStoreName}`);
    }

    if (monthlyData.trips > 8) {
      result.push(language === 'he'
        ? `💡 קניות פחות תכופות יכולות לחסוך זמן וכסף`
        : `💡 Fewer trips can save time and money`);
    }

    return result;
  }, [budget, monthlyData, storeData, totalAllTime, language]);

  const handleSaveBudget = () => {
    const value = parseFloat(budgetInput);
    if (!isNaN(value) && value > 0) {
      setBudget(value);
      localStorage.setItem(BUDGET_KEY, value.toString());
      setIsEditingBudget(false);
      setBudgetInput("");
    }
  };

  const budgetProgress = budget ? Math.min((monthlyData.total / budget) * 100, 100) : 0;
  const isOverBudget = budget ? monthlyData.total > budget : false;
  const isNearBudget = budget ? monthlyData.total > budget * 0.8 && !isOverBudget : false;

  const formatCurrency = (amount: number) => `₪${amount.toLocaleString(language === 'he' ? 'he-IL' : 'en-US', { maximumFractionDigits: 0 })}`;

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24" dir={direction}>
        <div className="sticky top-0 z-10 bg-card border-b-2 border-border">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/")} className="h-10 w-10 p-0 rounded-xl">
              <ArrowRight className={`h-5 w-5 ${language === "en" ? "rotate-180" : ""}`} />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                {t.title}
              </h1>
              <p className="text-xs text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Wallet className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t.empty.title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t.empty.desc}</p>
          <Button onClick={() => navigate("/")} className="rounded-xl">{t.empty.cta}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={direction}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b-2 border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/")} className="h-10 w-10 p-0 rounded-xl">
            <ArrowRight className={`h-5 w-5 ${language === "en" ? "rotate-180" : ""}`} />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              {t.title}
            </h1>
            <p className="text-xs text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* This Month Summary - Hero Card */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">{t.thisMonth}</span>
            {monthlyData.changeDirection !== 'same' && (
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                monthlyData.changeDirection === 'down' 
                  ? 'bg-success/15 text-success' 
                  : 'bg-destructive/15 text-destructive'
              }`}>
                {monthlyData.changeDirection === 'down' ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {Math.abs(monthlyData.change).toFixed(0)}%
              </div>
            )}
          </div>
          
          <p className="text-4xl font-bold text-foreground mb-4">
            {formatCurrency(monthlyData.total)}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card/80 rounded-xl p-3 text-center">
              <ShoppingBag className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{monthlyData.trips}</p>
              <p className="text-[10px] text-muted-foreground">{t.stats.trips}</p>
            </div>
            <div className="bg-card/80 rounded-xl p-3 text-center">
              <Wallet className="h-4 w-4 text-success mx-auto mb-1" />
              <p className="text-lg font-bold">{formatCurrency(monthlyData.average)}</p>
              <p className="text-[10px] text-muted-foreground">{t.stats.avgTrip}</p>
            </div>
            <div className="bg-card/80 rounded-xl p-3 text-center">
              <Store className="h-4 w-4 text-warning mx-auto mb-1" />
              <p className="text-sm font-bold truncate">{topStore || '-'}</p>
              <p className="text-[10px] text-muted-foreground">{t.stats.topStore}</p>
            </div>
          </div>
        </div>

        {/* Budget Tracker */}
        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-semibold">{t.budget.title}</span>
            </div>
            {budget && !isEditingBudget && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBudgetInput(budget.toString());
                  setIsEditingBudget(true);
                }}
                className="h-7 px-2 text-xs"
              >
                <Edit2 className="h-3 w-3 me-1" />
                {formatCurrency(budget)}
              </Button>
            )}
          </div>

          {!budget || isEditingBudget ? (
            <div className="flex gap-2">
              <Input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder={t.budget.placeholder}
                className="flex-1 h-10 rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
              />
              <Button onClick={handleSaveBudget} className="h-10 px-4 rounded-xl">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Progress
                  value={budgetProgress}
                  className={`h-3 rounded-full ${
                    isOverBudget ? "[&>div]:bg-destructive" : isNearBudget ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                  }`}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t.budget.spent}: <strong className="text-foreground">{formatCurrency(monthlyData.total)}</strong>
                </span>
                <span className={isOverBudget ? "text-destructive font-medium" : "text-success font-medium"}>
                  {isOverBudget ? t.budget.over : t.budget.left}: {formatCurrency(Math.abs(budget - monthlyData.total))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Store Breakdown - Simple List */}
        {storeData.length > 0 && (
          <div className="bg-card border-2 border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Store className="h-5 w-5 text-primary" />
              <span className="font-semibold">{t.stores.title}</span>
            </div>
            
            <div className="space-y-3">
              {storeData.map(([store, amount], index) => {
                const percentage = totalAllTime > 0 ? (amount / totalAllTime * 100) : 0;
                const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-destructive', 'bg-muted-foreground'];
                
                return (
                  <div key={store} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate flex-1">{store}</span>
                      <span className="text-muted-foreground ms-2">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips Section - Collapsible */}
        {tips.length > 0 && (
          <div className="bg-gradient-to-br from-warning/10 to-transparent border-2 border-warning/20 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowTips(!showTips)}
              className="w-full p-4 flex items-center justify-between text-start"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                <span className="font-semibold">{t.tips.title}</span>
                <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                  {tips.length}
                </span>
              </div>
              {showTips ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {showTips && (
              <div className="px-4 pb-4 space-y-2">
                {tips.map((tip, index) => (
                  <div key={index} className="bg-card/80 rounded-xl p-3 text-sm">
                    {tip}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
