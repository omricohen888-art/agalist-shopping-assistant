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
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/history")}
            className="h-10 w-10 p-0 rounded-xl hover:bg-muted"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground leading-none">📈 השוואת קניות</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">נתח את הרגלי הקנייה שלך</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {history.length < 2 ? (
          <div className="p-6 sm:p-10 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
            <div className="text-5xl sm:text-6xl mb-4 grayscale opacity-50">📊</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">לא מספיק נתונים להשוואה</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              בצע לפחות 2 קניות כדי לראות השוואות ותובנות
            </p>
            <Button onClick={() => navigate("/")} className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium rounded-xl">
              חזרה לרשימת קניות
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {mostExpensive && cheapest && storeComparison.length > 1 && (
              <div className="p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-sm space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">השוואת רשתות</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-destructive/10 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-destructive" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">הכי יקר בממוצע</h3>
                    </div>
                    <p className="text-2xl font-bold text-destructive mb-1">{mostExpensive.store}</p>
                    <p className="text-base text-muted-foreground">
                      ₪{mostExpensive.average.toFixed(2)} לקנייה
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      מבוסס על {mostExpensive.count} קניות
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-success/5 border border-success/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-success/10 rounded-xl">
                        <TrendingDown className="h-5 w-5 text-success" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">הכי זול בממוצע</h3>
                    </div>
                    <p className="text-2xl font-bold text-success mb-1">{cheapest.store}</p>
                    <p className="text-base text-muted-foreground">
                      ₪{cheapest.average.toFixed(2)} לקנייה
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      מבוסס על {cheapest.count} קניות
                    </p>
                  </div>
                </div>
                {mostExpensive.store !== cheapest.store && (
                  <div className="p-4 bg-warning/10 rounded-xl border border-warning/20">
                    <p className="text-center font-medium text-warning-foreground">
                      💡 חיסכון פוטנציאלי: ₪
                      {(mostExpensive.average - cheapest.average).toFixed(2)} לקנייה אם תעבור ל
                      {cheapest.store}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-sm space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">פירוט לפי רשת</h2>
              <div className="space-y-3">
                {storeComparison.map((store) => (
                  <div
                    key={store.store}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground">{store.store}</h3>
                      <p className="text-sm text-muted-foreground">
                        {store.count} קניות | ממוצע: ₪{store.average.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-primary">₪{store.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">סה״כ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {commonItems.length > 0 && (
              <div className="p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-sm space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">הפריטים הנקנים ביותר</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonItems.map(([item, count], index) => (
                    <div
                      key={item}
                      className="p-4 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <div className="text-xl font-bold text-primary mb-1">#{index + 1}</div>
                      <p className="font-medium text-foreground mb-1 text-sm">{item}</p>
                      <p className="text-xs text-muted-foreground">{count} פעמים</p>
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
