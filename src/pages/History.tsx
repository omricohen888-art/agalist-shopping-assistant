import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Trash2, Calendar, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { getShoppingHistory, deleteShoppingHistory, clearAllHistory } from "@/utils/storage";
import { ShoppingHistory as ShoppingHistoryType } from "@/types/shopping";
import { toast } from "sonner";

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ShoppingHistoryType[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = getShoppingHistory();
    setHistory(data);
  };

  const handleDelete = (id: string) => {
    if (deleteShoppingHistory(id)) {
      toast.success("הקנייה נמחקה");
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?")) {
      if (clearAllHistory()) {
        toast.success("כל ההיסטוריה נמחקה");
        loadHistory();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const totalSpent = history.reduce((sum, item) => sum + item.totalAmount, 0);
  const averageSpent = history.length > 0 ? totalSpent / history.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="h-10 w-10 p-0"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-primary">📊 היסטוריית קניות</h1>
              <p className="text-muted-foreground mt-1">כל הקניות שלך במקום אחד</p>
            </div>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={() => navigate("/compare")}
              className="h-11 px-6 font-semibold shadow-sm hover:shadow-md"
            >
              <TrendingUp className="ml-2 h-5 w-5" />
              השוואת קניות
            </Button>
          )}
        </div>

        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">סך הקניות</p>
              </div>
              <p className="text-3xl font-bold text-primary">{history.length}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-success" />
                <p className="text-sm font-medium text-muted-foreground">סה״כ הוצאות</p>
              </div>
              <p className="text-3xl font-bold text-success">₪{totalSpent.toFixed(2)}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-warning" />
                <p className="text-sm font-medium text-muted-foreground">ממוצע לקנייה</p>
              </div>
              <p className="text-3xl font-bold text-warning">₪{averageSpent.toFixed(2)}</p>
            </Card>
          </div>
        )}

        {history.length === 0 ? (
          <Card className="p-16 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold mb-2">אין עדיין קניות שנשמרו</h3>
            <p className="text-muted-foreground mb-6">
              התחל לסמן פריטים ולסיים קניות כדי לראות את ההיסטוריה שלך כאן
            </p>
            <Button onClick={() => navigate("/")} className="h-12 px-8 text-base">
              חזרה לרשימת קניות
            </Button>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{item.store}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <span>
                            {item.completedItems} מתוך {item.totalItems} פריטים
                          </span>
                        </div>
                        <div className="font-bold text-lg text-primary">
                          ₪{item.totalAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.items.slice(0, 5).map((shopItem) => (
                          <span
                            key={shopItem.id}
                            className={`text-xs px-3 py-1 rounded-full ${
                              shopItem.checked
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {shopItem.checked && "✓ "}
                            {shopItem.text}
                          </span>
                        ))}
                        {item.items.length > 5 && (
                          <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                            +{item.items.length - 5} נוספים
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="h-11 px-8 font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                מחק את כל ההיסטוריה
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
