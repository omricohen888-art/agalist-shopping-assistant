import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { getShoppingHistory } from "@/utils/storage";
import { ShoppingHistory } from "@/types/shopping";

const Compare = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ShoppingHistory[]>([]);

  useEffect(() => {
    const data = getShoppingHistory();
    setHistory(data);
  }, []);

  const storeStats = history.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = {
        count: 0,
        total: 0,
        items: [],
      };
    }
    acc[item.store].count += 1;
    acc[item.store].total += item.totalAmount;
    acc[item.store].items.push(...item.items.map((i) => i.text));
    return acc;
  }, {} as Record<string, { count: number; total: number; items: string[] }>);

  const storeComparison = Object.entries(storeStats)
    .map(([store, stats]) => ({
      store,
      count: stats.count,
      total: stats.total,
      average: stats.total / stats.count,
      items: stats.items,
    }))
    .sort((a, b) => b.average - a.average);

  const mostExpensive = storeComparison[0];
  const cheapest = storeComparison[storeComparison.length - 1];

  const commonItems = history.length > 0 ? (() => {
    const itemCounts: Record<string, number> = {};
    history.forEach((shopping) => {
      shopping.items.forEach((item) => {
        itemCounts[item.text] = (itemCounts[item.text] || 0) + 1;
      });
    });
    return Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  })() : [];

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b-2 border-black dark:border-slate-700">
        <div className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/history")}
            className="h-10 w-10 p-0 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-foreground leading-none">📈 השוואת קניות</h1>
            <p className="text-[10px] sm:text-sm text-muted-foreground font-bold">נתח את הרגלי הקנייה שלך</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
        {history.length < 2 ? (
          <div className="p-6 sm:p-10 text-center rounded-3xl border-2 border-dashed border-black/20 dark:border-white/20">
            <div className="text-5xl sm:text-6xl mb-4 grayscale opacity-50">📊</div>
            <h3 className="text-xl sm:text-2xl font-black mb-2 text-foreground">לא מספיק נתונים להשוואה</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 font-medium">
              בצע לפחות 2 קניות כדי לראות השוואות ותובנות
            </p>
            <Button onClick={() => navigate("/")} className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              חזרה לרשימת קניות
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {mostExpensive && cheapest && storeComparison.length > 1 && (
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">השוואת רשתות</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-[#FFF1F2] dark:bg-slate-800 border-2 border-black dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-red-400 rounded-lg border-2 border-black dark:border-slate-900">
                        <TrendingUp className="h-5 w-5 text-black" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">הכי יקר בממוצע</h3>
                    </div>
                    <p className="text-3xl font-black text-destructive mb-2">{mostExpensive.store}</p>
                    <p className="text-lg font-bold text-muted-foreground">
                      ₪{mostExpensive.average.toFixed(2)} לקנייה
                    </p>
                    <p className="text-sm font-medium text-muted-foreground mt-2">
                      מבוסס על {mostExpensive.count} קניות
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-[#F0FDF4] dark:bg-slate-800 border-2 border-black dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-green-400 rounded-lg border-2 border-black dark:border-slate-900">
                        <TrendingDown className="h-5 w-5 text-black" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">הכי זול בממוצע</h3>
                    </div>
                    <p className="text-3xl font-black text-success mb-2">{cheapest.store}</p>
                    <p className="text-lg font-bold text-muted-foreground">
                      ₪{cheapest.average.toFixed(2)} לקנייה
                    </p>
                    <p className="text-sm font-medium text-muted-foreground mt-2">
                      מבוסס על {cheapest.count} קניות
                    </p>
                  </div>
                </div>
                {mostExpensive.store !== cheapest.store && (
                  <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-400 border-dashed">
                    <p className="text-center font-bold text-yellow-700 dark:text-yellow-400">
                      💡 חיסכון פוטנציאלי: ₪
                      {(mostExpensive.average - cheapest.average).toFixed(2)} לקנייה אם תעבור ל
                      {cheapest.store}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">פירוט לפי רשת</h2>
              <div className="space-y-4">
                {storeComparison.map((store) => (
                  <div
                    key={store.store}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 rounded-xl bg-muted/30 border-2 border-transparent hover:border-black dark:hover:border-slate-500 transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-foreground">{store.store}</h3>
                      <p className="text-sm font-medium text-muted-foreground">
                        {store.count} קניות | ממוצע: ₪{store.average.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-black text-primary">₪{store.total.toFixed(2)}</p>
                      <p className="text-xs font-bold text-muted-foreground">סה״כ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {commonItems.length > 0 && (
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">הפריטים הנקנים ביותר</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {commonItems.map(([item, count], index) => (
                    <div
                      key={item}
                      className="p-4 sm:p-5 rounded-xl bg-primary/5 border-2 border-primary/20 hover:border-primary transition-colors"
                    >
                      <div className="text-2xl font-black text-primary mb-1">#{index + 1}</div>
                      <p className="font-bold text-foreground mb-1">{item}</p>
                      <p className="text-sm font-medium text-muted-foreground">{count} פעמים</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
