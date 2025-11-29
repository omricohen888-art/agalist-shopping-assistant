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
    <div className="bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/history")}
            className="h-10 w-10 p-0"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-primary">📈 השוואת קניות</h1>
            <p className="text-muted-foreground mt-1">נתח את הרגלי הקנייה שלך</p>
          </div>
        </div>

        {history.length < 2 ? (
          <Card className="p-16 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">לא מספיק נתונים להשוואה</h3>
            <p className="text-muted-foreground mb-6">
              בצע לפחות 2 קניות כדי לראות השוואות ותובנות
            </p>
            <Button onClick={() => navigate("/")} className="h-12 px-8 text-base">
              חזרה לרשימת קניות
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {mostExpensive && cheapest && storeComparison.length > 1 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">השוואת רשתות</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/20">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-6 w-6 text-destructive" />
                      <h3 className="text-lg font-bold">הכי יקר בממוצע</h3>
                    </div>
                    <p className="text-3xl font-bold text-destructive mb-2">{mostExpensive.store}</p>
                    <p className="text-lg text-muted-foreground">
                      ₪{mostExpensive.average.toFixed(2)} לקנייה
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      מבוסס על {mostExpensive.count} קניות
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="h-6 w-6 text-success" />
                      <h3 className="text-lg font-bold">הכי זול בממוצע</h3>
                    </div>
                    <p className="text-3xl font-bold text-success mb-2">{cheapest.store}</p>
                    <p className="text-lg text-muted-foreground">
                      ₪{cheapest.average.toFixed(2)} לקנייה
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      מבוסס על {cheapest.count} קניות
                    </p>
                  </div>
                </div>
                {mostExpensive.store !== cheapest.store && (
                  <div className="mt-6 p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="text-center font-semibold text-warning">
                      💡 חיסכון פוטנציאלי: ₪
                      {(mostExpensive.average - cheapest.average).toFixed(2)} לקנייה אם תעבור ל
                      {cheapest.store}
                    </p>
                  </div>
                )}
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">פירוט לפי רשת</h2>
              <div className="space-y-4">
                {storeComparison.map((store) => (
                  <div
                    key={store.store}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{store.store}</h3>
                      <p className="text-sm text-muted-foreground">
                        {store.count} קניות | ממוצע: ₪{store.average.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold text-primary">₪{store.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">סה״כ</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {commonItems.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">הפריטים הנקנים ביותר</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonItems.map(([item, count], index) => (
                    <div
                      key={item}
                      className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                    >
                      <div className="text-2xl font-bold text-primary mb-1">#{index + 1}</div>
                      <p className="font-semibold mb-1">{item}</p>
                      <p className="text-sm text-muted-foreground">{count} פעמים</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
