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
  Calendar,
  CalendarDays,
  Trophy,
  Flame,
  RotateCcw,
  X,
} from "lucide-react";
import { getShoppingHistory } from "@/utils/storage";
import { ShoppingHistory } from "@/types/shopping";
import { useGlobalLanguage, Language } from "@/context/LanguageContext";
import { toast } from "sonner";

const BUDGET_KEY = "user_budget";
const SAVINGS_GOAL_KEY = "savings_goal";
const STREAK_KEY = "budget_streak";

type BudgetPeriod = 'weekly' | 'monthly';

const translations: Record<Language, {
  title: string;
  subtitle: string;
  back: string;
  thisMonth: string;
  thisWeek: string;
  budget: {
    title: string;
    weekly: string;
    monthly: string;
    set: string;
    placeholder: string;
    spent: string;
    left: string;
    over: string;
    good: string;
    warning: string;
    reset: string;
  };
  stats: {
    trips: string;
    avgTrip: string;
    topStore: string;
  };
  tips: {
    title: string;
  };
  stores: {
    title: string;
  };
  goal: {
    title: string;
    placeholder: string;
    set: string;
    saved: string;
    toGo: string;
    reached: string;
    congrats: string;
  };
  streak: {
    title: string;
    days: string;
    weeks: string;
    underBudget: string;
    keepGoing: string;
  };
  actions: {
    setGoal: string;
    trackBudget: string;
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
    thisWeek: "השבוע",
    budget: {
      title: "תקציב",
      weekly: "שבועי",
      monthly: "חודשי",
      set: "הגדר",
      placeholder: "סכום בש״ח",
      spent: "הוצאת",
      left: "נותר",
      over: "חריגה",
      good: "במסלול!",
      warning: "קרוב לגבול",
      reset: "אפס",
    },
    stats: {
      trips: "קניות",
      avgTrip: "ממוצע",
      topStore: "חנות מובילה",
    },
    tips: {
      title: "טיפים",
    },
    stores: {
      title: "הוצאות לפי חנות",
    },
    goal: {
      title: "יעד חיסכון",
      placeholder: "כמה לחסוך?",
      set: "הגדר יעד",
      saved: "חסכת",
      toGo: "נותרו",
      reached: "הגעת ליעד! 🎉",
      congrats: "כל הכבוד!",
    },
    streak: {
      title: "רצף",
      days: "ימים",
      weeks: "שבועות",
      underBudget: "בתוך התקציב",
      keepGoing: "המשך כך!",
    },
    actions: {
      setGoal: "הגדר יעד חיסכון",
      trackBudget: "עקוב אחרי תקציב",
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
    thisWeek: "This Week",
    budget: {
      title: "Budget",
      weekly: "Weekly",
      monthly: "Monthly",
      set: "Set",
      placeholder: "Amount in ₪",
      spent: "Spent",
      left: "Left",
      over: "Over",
      good: "On Track!",
      warning: "Near Limit",
      reset: "Reset",
    },
    stats: {
      trips: "Trips",
      avgTrip: "Average",
      topStore: "Top Store",
    },
    tips: {
      title: "Tips",
    },
    stores: {
      title: "Spending by Store",
    },
    goal: {
      title: "Savings Goal",
      placeholder: "How much to save?",
      set: "Set Goal",
      saved: "Saved",
      toGo: "to go",
      reached: "Goal Reached! 🎉",
      congrats: "Congrats!",
    },
    streak: {
      title: "Streak",
      days: "days",
      weeks: "weeks",
      underBudget: "under budget",
      keepGoing: "Keep going!",
    },
    actions: {
      setGoal: "Set savings goal",
      trackBudget: "Track budget",
    },
    empty: {
      title: "No data yet",
      desc: "Complete shopping trips to see insights",
      cta: "Back to list",
    },
  },
};

interface BudgetData {
  amount: number;
  period: BudgetPeriod;
}

const Insights = () => {
  const navigate = useNavigate();
  const { language } = useGlobalLanguage();
  const t = translations[language];
  const direction = language === "he" ? "rtl" : "ltr";

  const [history, setHistory] = useState<ShoppingHistory[]>([]);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>('monthly');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [showTips, setShowTips] = useState(false);
  
  // Savings goal
  const [savingsGoal, setSavingsGoal] = useState<number | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  useEffect(() => {
    setHistory(getShoppingHistory());
    
    const savedBudget = localStorage.getItem(BUDGET_KEY);
    if (savedBudget) {
      try {
        setBudget(JSON.parse(savedBudget));
      } catch {
        // Legacy format - just a number
        setBudget({ amount: parseFloat(savedBudget), period: 'monthly' });
      }
    }
    
    const savedGoal = localStorage.getItem(SAVINGS_GOAL_KEY);
    if (savedGoal) setSavingsGoal(parseFloat(savedGoal));
  }, []);

  // Date calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Spending calculations
  const spendingData = useMemo(() => {
    const thisMonth = history.filter(item => {
      const date = new Date(item.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const thisWeek = history.filter(item => {
      const date = new Date(item.date);
      return date >= startOfWeek;
    });

    const lastMonth = history.filter(item => {
      const date = new Date(item.date);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    const monthlyTotal = thisMonth.reduce((sum, item) => sum + item.totalAmount, 0);
    const weeklyTotal = thisWeek.reduce((sum, item) => sum + item.totalAmount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, item) => sum + item.totalAmount, 0);
    
    const monthlyChange = lastMonthTotal > 0 ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    return {
      monthly: {
        total: monthlyTotal,
        trips: thisMonth.length,
        average: thisMonth.length > 0 ? monthlyTotal / thisMonth.length : 0,
      },
      weekly: {
        total: weeklyTotal,
        trips: thisWeek.length,
        average: thisWeek.length > 0 ? weeklyTotal / thisWeek.length : 0,
      },
      change: monthlyChange,
      changeDirection: monthlyChange > 5 ? 'up' : monthlyChange < -5 ? 'down' : 'same',
    };
  }, [history, currentMonth, currentYear, startOfWeek]);

  // Current period data based on budget period
  const currentPeriodData = budget?.period === 'weekly' ? spendingData.weekly : spendingData.monthly;

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

  // Savings calculation (difference from last month if spending decreased)
  const savingsAmount = useMemo(() => {
    if (spendingData.changeDirection === 'down') {
      const lastMonthAvg = history
        .filter(item => {
          const date = new Date(item.date);
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          return date.getMonth() === prevMonth;
        })
        .reduce((sum, item) => sum + item.totalAmount, 0);
      return Math.max(0, lastMonthAvg - spendingData.monthly.total);
    }
    return 0;
  }, [spendingData, history, currentMonth]);

  // Tips generation
  const tips = useMemo(() => {
    const result: string[] = [];

    if (budget && currentPeriodData.total > budget.amount) {
      result.push(language === 'he'
        ? `⚠️ חרגת מהתקציב ב-₪${(currentPeriodData.total - budget.amount).toFixed(0)}`
        : `⚠️ Over budget by ₪${(currentPeriodData.total - budget.amount).toFixed(0)}`);
    }

    if (spendingData.changeDirection === 'up' && spendingData.change > 20) {
      result.push(language === 'he'
        ? `📈 ההוצאות עלו ב-${spendingData.change.toFixed(0)}% מהחודש הקודם`
        : `📈 Spending up ${spendingData.change.toFixed(0)}% from last month`);
    }

    if (spendingData.changeDirection === 'down') {
      result.push(language === 'he'
        ? `🎉 כל הכבוד! חסכת ${Math.abs(spendingData.change).toFixed(0)}% מהחודש הקודם`
        : `🎉 Great! Saved ${Math.abs(spendingData.change).toFixed(0)}% from last month`);
    }

    if (storeData.length > 1) {
      const [topStoreName, topAmount] = storeData[0];
      const percentage = totalAllTime > 0 ? (topAmount / totalAllTime * 100).toFixed(0) : 0;
      result.push(language === 'he'
        ? `🏪 ${percentage}% מההוצאות שלך ב${topStoreName}`
        : `🏪 ${percentage}% of spending at ${topStoreName}`);
    }

    return result;
  }, [budget, currentPeriodData, spendingData, storeData, totalAllTime, language]);

  const handleSaveBudget = () => {
    const value = parseFloat(budgetInput);
    if (!isNaN(value) && value > 0) {
      const newBudget = { amount: value, period: budgetPeriod };
      setBudget(newBudget);
      localStorage.setItem(BUDGET_KEY, JSON.stringify(newBudget));
      setIsEditingBudget(false);
      setBudgetInput("");
      toast.success(language === 'he' ? 'התקציב נשמר!' : 'Budget saved!');
    }
  };

  const handleResetBudget = () => {
    setBudget(null);
    localStorage.removeItem(BUDGET_KEY);
    setIsEditingBudget(false);
    toast.success(language === 'he' ? 'התקציב אופס' : 'Budget reset');
  };

  const handleSaveGoal = () => {
    const value = parseFloat(goalInput);
    if (!isNaN(value) && value > 0) {
      setSavingsGoal(value);
      localStorage.setItem(SAVINGS_GOAL_KEY, value.toString());
      setIsEditingGoal(false);
      setGoalInput("");
      toast.success(language === 'he' ? 'יעד החיסכון נשמר!' : 'Goal saved!');
    }
  };

  const handleResetGoal = () => {
    setSavingsGoal(null);
    localStorage.removeItem(SAVINGS_GOAL_KEY);
    setIsEditingGoal(false);
  };

  const budgetProgress = budget ? Math.min((currentPeriodData.total / budget.amount) * 100, 100) : 0;
  const isOverBudget = budget ? currentPeriodData.total > budget.amount : false;
  const isNearBudget = budget ? currentPeriodData.total > budget.amount * 0.8 && !isOverBudget : false;
  const goalProgress = savingsGoal ? Math.min((savingsAmount / savingsGoal) * 100, 100) : 0;

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

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Period Summary - Hero Card */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {budget?.period === 'weekly' ? t.thisWeek : t.thisMonth}
            </span>
            {spendingData.changeDirection !== 'same' && (
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                spendingData.changeDirection === 'down'
                  ? 'bg-success/15 text-success'
                  : 'bg-destructive/15 text-destructive'
              }`}>
                {spendingData.changeDirection === 'down' ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {Math.abs(spendingData.change).toFixed(0)}%
              </div>
            )}
          </div>

          <p className="text-4xl font-bold text-foreground mb-4">
            {formatCurrency(currentPeriodData.total)}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card/80 rounded-xl p-2.5 text-center">
              <ShoppingBag className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{currentPeriodData.trips}</p>
              <p className="text-[10px] text-muted-foreground">{t.stats.trips}</p>
            </div>
            <div className="bg-card/80 rounded-xl p-2.5 text-center">
              <Wallet className="h-4 w-4 text-success mx-auto mb-1" />
              <p className="text-lg font-bold">{formatCurrency(currentPeriodData.average)}</p>
              <p className="text-[10px] text-muted-foreground">{t.stats.avgTrip}</p>
            </div>
            <div className="bg-card/80 rounded-xl p-2.5 text-center">
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
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBudgetInput(budget.amount.toString());
                    setBudgetPeriod(budget.period);
                    setIsEditingBudget(true);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  <Edit2 className="h-3 w-3 me-1" />
                  {formatCurrency(budget.amount)}
                </Button>
              </div>
            )}
          </div>

          {!budget || isEditingBudget ? (
            <div className="space-y-3">
              {/* Period Toggle */}
              <div className="flex bg-muted rounded-xl p-1">
                <button
                  onClick={() => setBudgetPeriod('weekly')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    budgetPeriod === 'weekly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {t.budget.weekly}
                </button>
                <button
                  onClick={() => setBudgetPeriod('monthly')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    budgetPeriod === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {t.budget.monthly}
                </button>
              </div>

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
                {budget && (
                  <Button variant="ghost" onClick={() => setIsEditingBudget(false)} className="h-10 px-3 rounded-xl">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {budget && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetBudget}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <RotateCcw className="h-3.5 w-3.5 me-1.5" />
                  {t.budget.reset}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Period indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {budget.period === 'weekly' ? (
                  <Calendar className="h-3.5 w-3.5" />
                ) : (
                  <CalendarDays className="h-3.5 w-3.5" />
                )}
                {budget.period === 'weekly' ? t.budget.weekly : t.budget.monthly}
              </div>

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
                  {t.budget.spent}: <strong className="text-foreground">{formatCurrency(currentPeriodData.total)}</strong>
                </span>
                <span className={isOverBudget ? "text-destructive font-medium" : "text-success font-medium"}>
                  {isOverBudget ? t.budget.over : t.budget.left}: {formatCurrency(Math.abs(budget.amount - currentPeriodData.total))}
                </span>
              </div>

              {/* Status badge */}
              <div className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium ${
                isOverBudget ? 'bg-destructive/10 text-destructive' : isNearBudget ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
              }`}>
                {isOverBudget ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <Trophy className="h-4 w-4" />
                )}
                {isOverBudget ? t.budget.over : isNearBudget ? t.budget.warning : t.budget.good}
              </div>
            </div>
          )}
        </div>

        {/* Savings Goal */}
        <div className="bg-gradient-to-br from-success/10 to-transparent border-2 border-success/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-success" />
              <span className="font-semibold">{t.goal.title}</span>
            </div>
            {savingsGoal && !isEditingGoal && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGoalInput(savingsGoal.toString());
                  setIsEditingGoal(true);
                }}
                className="h-7 px-2 text-xs"
              >
                <Edit2 className="h-3 w-3 me-1" />
                {formatCurrency(savingsGoal)}
              </Button>
            )}
          </div>

          {!savingsGoal || isEditingGoal ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder={t.goal.placeholder}
                  className="flex-1 h-10 rounded-xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                />
                <Button onClick={handleSaveGoal} className="h-10 px-4 rounded-xl bg-success hover:bg-success/90">
                  <Check className="h-4 w-4" />
                </Button>
                {savingsGoal && (
                  <Button variant="ghost" onClick={() => setIsEditingGoal(false)} className="h-10 px-3 rounded-xl">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {savingsGoal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetGoal}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <RotateCcw className="h-3.5 w-3.5 me-1.5" />
                  {t.budget.reset}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Progress
                  value={goalProgress}
                  className="h-3 rounded-full [&>div]:bg-success"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t.goal.saved}: <strong className="text-success">{formatCurrency(savingsAmount)}</strong>
                </span>
                <span className="text-muted-foreground">
                  {goalProgress >= 100 ? t.goal.reached : `${t.goal.toGo}: ${formatCurrency(savingsGoal - savingsAmount)}`}
                </span>
              </div>
              {goalProgress >= 100 && (
                <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-success/10 text-success text-sm font-medium">
                  <Flame className="h-4 w-4" />
                  {t.goal.congrats}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Store Breakdown */}
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

        {/* Tips Section */}
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
