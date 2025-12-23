import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  TrendingUp,
  Target,
  PieChart,
  Lightbulb,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Save,
} from "lucide-react";
import { getShoppingHistory } from "@/utils/storage";
import { ShoppingHistory } from "@/types/shopping";
import { useGlobalLanguage, Language } from "@/context/LanguageContext";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const BUDGET_KEY = "monthly_budget";

const insightsTranslations: Record<
  Language,
  {
    title: string;
    subtitle: string;
    backAria: string;
    budget: {
      title: string;
      setButton: string;
      editButton: string;
      saveButton: string;
      placeholder: string;
      spent: string;
      remaining: string;
      overBudget: string;
      onTrack: string;
      warning: string;
      noBudget: string;
    };
    stores: {
      title: string;
      noData: string;
    };
    trends: {
      title: string;
      noData: string;
    };
    topItems: {
      title: string;
      times: string;
    };
    ai: {
      title: string;
      description: string;
      generating: string;
      getAdvice: string;
      error: string;
    };
    emptyState: {
      title: string;
      description: string;
      cta: string;
    };
  }
> = {
  he: {
    title: "📊 תובנות כלכליות",
    subtitle: "נתונים וייעוץ חכם על הקניות שלך",
    backAria: "חזרה",
    budget: {
      title: "תקציב חודשי",
      setButton: "הגדר תקציב",
      editButton: "ערוך",
      saveButton: "שמור",
      placeholder: "סכום בש״ח...",
      spent: "הוצאת",
      remaining: "נותרו",
      overBudget: "חריגה מהתקציב!",
      onTrack: "מצוין! את/ה בתוך התקציב",
      warning: "שימו לב! מתקרבים לגבול התקציב",
      noBudget: "הגדר תקציב חודשי כדי לעקוב אחרי ההוצאות",
    },
    stores: {
      title: "התפלגות הוצאות לפי רשת",
      noData: "אין מספיק נתונים",
    },
    trends: {
      title: "מגמת הוצאות חודשית",
      noData: "אין מספיק נתונים להצגת מגמות",
    },
    topItems: {
      title: "הפריטים הנפוצים ביותר",
      times: "פעמים",
    },
    ai: {
      title: "ייעוץ חכם עם AI",
      description: "קבל המלצות מותאמות אישית לחיסכון על בסיס הרגלי הקנייה שלך",
      generating: "מנתח את הנתונים שלך...",
      getAdvice: "קבל ייעוץ חכם",
      error: "לא הצלחנו לייצר ייעוץ. נסה שוב.",
    },
    emptyState: {
      title: "אין עדיין נתונים",
      description: "השלם קניות כדי לראות תובנות וסטטיסטיקות",
      cta: "לרשימת הקניות",
    },
  },
  en: {
    title: "📊 Financial Insights",
    subtitle: "Smart data and advice about your shopping",
    backAria: "Back",
    budget: {
      title: "Monthly Budget",
      setButton: "Set Budget",
      editButton: "Edit",
      saveButton: "Save",
      placeholder: "Amount in ₪...",
      spent: "Spent",
      remaining: "Remaining",
      overBudget: "Over budget!",
      onTrack: "Great! You're on track",
      warning: "Warning! Approaching budget limit",
      noBudget: "Set a monthly budget to track spending",
    },
    stores: {
      title: "Spending by Store",
      noData: "Not enough data",
    },
    trends: {
      title: "Monthly Spending Trend",
      noData: "Not enough data for trends",
    },
    topItems: {
      title: "Most Purchased Items",
      times: "times",
    },
    ai: {
      title: "Smart AI Advice",
      description: "Get personalized savings recommendations based on your shopping habits",
      generating: "Analyzing your data...",
      getAdvice: "Get Smart Advice",
      error: "Could not generate advice. Please try again.",
    },
    emptyState: {
      title: "No data yet",
      description: "Complete shopping trips to see insights and statistics",
      cta: "Go to Shopping List",
    },
  },
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

const Insights = () => {
  const navigate = useNavigate();
  const { language } = useGlobalLanguage();
  const t = insightsTranslations[language];
  const direction = language === "he" ? "rtl" : "ltr";
  const locale = language === "he" ? "he-IL" : "en-US";

  const [history, setHistory] = useState<ShoppingHistory[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    const data = getShoppingHistory();
    setHistory(data);

    const savedBudget = localStorage.getItem(BUDGET_KEY);
    if (savedBudget) {
      setBudget(parseFloat(savedBudget));
    }
  }, []);

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  });

  // Get current month's spending
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySpending = history
    .filter((item) => {
      const date = new Date(item.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + item.totalAmount, 0);

  // Store breakdown for pie chart
  const storeData = history.reduce((acc, item) => {
    const store = item.store || "אחר";
    acc[store] = (acc[store] || 0) + item.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(storeData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Monthly trends for line chart
  const monthlyTrends = history.reduce((acc, item) => {
    const date = new Date(item.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + item.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const trendData = Object.entries(monthlyTrends)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => {
      const [year, monthNum] = month.split("-");
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return {
        month: date.toLocaleDateString(locale, { month: "short" }),
        amount,
      };
    });

  // Top items
  const itemCounts: Record<string, number> = {};
  history.forEach((trip) => {
    trip.items.forEach((item) => {
      const name = item.text.trim();
      if (name) {
        itemCounts[name] = (itemCounts[name] || 0) + 1;
      }
    });
  });

  const topItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const handleSaveBudget = () => {
    const value = parseFloat(budgetInput);
    if (!isNaN(value) && value > 0) {
      setBudget(value);
      localStorage.setItem(BUDGET_KEY, value.toString());
      setIsEditingBudget(false);
      setBudgetInput("");
    }
  };

  const budgetProgress = budget ? Math.min((monthlySpending / budget) * 100, 100) : 0;
  const isOverBudget = budget ? monthlySpending > budget : false;
  const isNearBudget = budget ? monthlySpending > budget * 0.8 && !isOverBudget : false;

  const handleGetAIAdvice = () => {
    setIsLoadingAI(true);
    setAiAdvice(null);

    const totalSpent = history.reduce((sum, item) => sum + item.totalAmount, 0);
    const avgPerTrip = history.length > 0 ? totalSpent / history.length : 0;

    // Generate local advice after a small delay for UX
    setTimeout(() => {
      const advice: string[] = [];

      // Budget analysis
      if (budget && budget > 0) {
        const budgetUsage = (monthlySpending / budget) * 100;
        if (monthlySpending > budget) {
          advice.push(`⚠️ חרגת מהתקציב ב-${(monthlySpending - budget).toFixed(0)}₪. שקול/י לצמצם קניות בחודש הבא.`);
        } else if (budgetUsage > 80) {
          advice.push(`💡 ניצלת ${budgetUsage.toFixed(0)}% מהתקציב. נשארו לך ${(budget - monthlySpending).toFixed(0)}₪.`);
        } else {
          advice.push(`✅ מצוין! ניצלת רק ${budgetUsage.toFixed(0)}% מהתקציב החודשי.`);
        }
      }

      // Store comparison
      if (pieData.length > 1) {
        const sortedStores = [...pieData].sort((a, b) => b.value - a.value);
        const mostExpensive = sortedStores[0];
        const cheapest = sortedStores[sortedStores.length - 1];
        if (mostExpensive.value > cheapest.value * 1.5) {
          advice.push(`🏪 הוצאת הכי הרבה ב${mostExpensive.name} (${mostExpensive.value.toFixed(0)}₪). שקול/י להשוות מחירים עם ${cheapest.name}.`);
        }
      }

      // Shopping frequency
      if (history.length >= 3) {
        advice.push(`🛒 ממוצע הוצאה לקנייה: ${avgPerTrip.toFixed(0)}₪. קניות גדולות יותר ופחות תכופות יכולות לחסוך זמן וכסף.`);
      }

      // Most purchased items
      if (topItems.length > 0) {
        const topItem = topItems[0];
        advice.push(`📦 הפריט הנפוץ ביותר: ${topItem[0]} (${topItem[1]} פעמים). שקול/י לקנות באריזות גדולות יותר.`);
      }

      // Monthly trend
      if (trendData.length >= 2) {
        const lastMonth = trendData[trendData.length - 1];
        const prevMonth = trendData[trendData.length - 2];
        if (lastMonth && prevMonth) {
          const change = ((lastMonth.amount - prevMonth.amount) / prevMonth.amount) * 100;
          if (change > 20) {
            advice.push(`📈 ההוצאות עלו ב-${change.toFixed(0)}% מהחודש הקודם. בדוק/י מה השתנה.`);
          } else if (change < -10) {
            advice.push(`📉 כל הכבוד! חסכת ${Math.abs(change).toFixed(0)}% מהחודש הקודם.`);
          }
        }
      }

      // Total spending insight
      if (totalSpent > 0) {
        advice.push(`💰 סה״כ הוצאת ${totalSpent.toFixed(0)}₪ ב-${history.length} קניות.`);
      }

      if (advice.length === 0) {
        advice.push('📊 המשך/י לתעד קניות כדי לקבל תובנות מותאמות אישית!');
      }

      setAiAdvice(advice.join('\n\n'));
      setIsLoadingAI(false);
    }, 800);
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24" dir={direction} lang={language}>
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              aria-label={t.backAria}
              className="h-10 w-10 p-0 rounded-xl hover:bg-muted"
            >
              <ArrowRight className={`h-5 w-5 ${language === "en" ? "rotate-180" : ""}`} />
            </Button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">{t.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 py-12">
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
            <div className="text-5xl mb-4 grayscale opacity-50">📊</div>
            <h3 className="text-xl font-bold mb-2">{t.emptyState.title}</h3>
            <p className="text-muted-foreground mb-6">{t.emptyState.description}</p>
            <Button onClick={() => navigate("/")} className="rounded-xl">
              {t.emptyState.cta}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={direction} lang={language}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            aria-label={t.backAria}
            className="h-10 w-10 p-0 rounded-xl hover:bg-muted"
          >
            <ArrowRight className={`h-5 w-5 ${language === "en" ? "rotate-180" : ""}`} />
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Budget Section */}
        <Card className="p-5 sm:p-6 rounded-2xl border-2 border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold">{t.budget.title}</h2>
            </div>
            {budget && !isEditingBudget && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBudgetInput(budget.toString());
                  setIsEditingBudget(true);
                }}
                className="h-8 rounded-lg"
              >
                <Edit2 className="h-4 w-4 me-1" />
                {t.budget.editButton}
              </Button>
            )}
          </div>

          {!budget || isEditingBudget ? (
            <div className="flex gap-3">
              <Input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder={t.budget.placeholder}
                className="flex-1 h-11 rounded-xl"
              />
              <Button onClick={handleSaveBudget} className="h-11 px-5 rounded-xl">
                <Save className="h-4 w-4 me-2" />
                {isEditingBudget ? t.budget.saveButton : t.budget.setButton}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Progress
                  value={budgetProgress}
                  className={`h-4 rounded-full ${
                    isOverBudget
                      ? "[&>div]:bg-destructive"
                      : isNearBudget
                      ? "[&>div]:bg-warning"
                      : "[&>div]:bg-success"
                  }`}
                />
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t.budget.spent}: <strong className="text-foreground">{currencyFormatter.format(monthlySpending)}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    {isOverBudget ? t.budget.overBudget : `${t.budget.remaining}: `}
                    {!isOverBudget && (
                      <strong className="text-success">{currencyFormatter.format(budget - monthlySpending)}</strong>
                    )}
                  </span>
                </div>
              </div>

              {/* Status message */}
              <div
                className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                  isOverBudget
                    ? "bg-destructive/10 text-destructive"
                    : isNearBudget
                    ? "bg-warning/10 text-warning"
                    : "bg-success/10 text-success"
                }`}
              >
                {isOverBudget ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : isNearBudget ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {isOverBudget ? t.budget.overBudget : isNearBudget ? t.budget.warning : t.budget.onTrack}
              </div>
            </div>
          )}
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Store Breakdown */}
          <Card className="p-5 sm:p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold">{t.stores.title}</h2>
            </div>

            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => currencyFormatter.format(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {t.stores.noData}
              </div>
            )}
          </Card>

          {/* Line Chart - Monthly Trends */}
          <Card className="p-5 sm:p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-success/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <h2 className="text-lg font-bold">{t.trends.title}</h2>
            </div>

            {trendData.length >= 2 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₪${v}`} />
                    <Tooltip
                      formatter={(value: number) => currencyFormatter.format(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {t.trends.noData}
              </div>
            )}
          </Card>
        </div>

        {/* Top Items Bar Chart */}
        {topItems.length > 0 && (
          <Card className="p-5 sm:p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-warning/10 rounded-xl">
                <Lightbulb className="h-5 w-5 text-warning" />
              </div>
              <h2 className="text-lg font-bold">{t.topItems.title}</h2>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems.map(([name, count]) => ({ name, count }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={100}
                    tickFormatter={(v) => (v.length > 12 ? v.slice(0, 12) + "..." : v)}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} ${t.topItems.times}`]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* AI Advice Section */}
        <Card className="p-5 sm:p-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t.ai.title}</h2>
              <p className="text-sm text-muted-foreground">{t.ai.description}</p>
            </div>
          </div>

          {aiAdvice ? (
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {aiAdvice}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetAIAdvice}
                disabled={isLoadingAI}
                className="mt-4 rounded-lg"
              >
                {isLoadingAI ? t.ai.generating : t.ai.getAdvice}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleGetAIAdvice}
              disabled={isLoadingAI}
              className="w-full h-12 rounded-xl font-medium"
            >
              {isLoadingAI ? (
                <>
                  <div className="h-4 w-4 me-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t.ai.generating}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 me-2" />
                  {t.ai.getAdvice}
                </>
              )}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Insights;
