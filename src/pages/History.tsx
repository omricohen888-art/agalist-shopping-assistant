import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Trash2, Calendar, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { getShoppingHistory, deleteShoppingHistory, clearAllHistory } from "@/utils/storage";
import { ShoppingHistory as ShoppingHistoryType } from "@/types/shopping";
import { toast } from "sonner";
import { useLanguage, Language } from "@/hooks/use-language";

const historyTranslations: Record<
  Language,
  {
    backAria: string;
    title: string;
    subtitle: string;
    compare: string;
    stats: {
      totalPurchases: string;
      totalSpend: string;
      averageSpend: string;
    };
    summary: {
      heading: string;
      description: string;
      cta: string;
    };
    itemsProgress: (completed: number, total: number) => string;
    itemsExtra: (count: number) => string;
    deleteItem: string;
    clearAll: string;
    confirmClear: string;
    toasts: {
      deleted: string;
      cleared: string;
    };
    emptyState: {
      title: string;
      description: string;
      cta: string;
    };
    languageLabel: string;
    languageAria: string;
    currencyLabel: string;
    noHistory: string;
  }
> = {
  he: {
    backAria: "חזרה לדף הבית",
    title: "📊 היסטוריית קניות",
    subtitle: "כל הקניות שלך במקום אחד",
    compare: "השוואת קניות",
    stats: {
      totalPurchases: "סך הקניות",
      totalSpend: "סה״כ הוצאות",
      averageSpend: "ממוצע לקנייה",
    },
    summary: {
      heading: "אין עדיין קניות שנשמרו",
      description: "התחל לסמן פריטים ולסיים קניות כדי לראות את ההיסטוריה שלך כאן.",
      cta: "חזרה לרשימת קניות",
    },
    itemsProgress: (completed, total) => `${completed} מתוך ${total} פריטים`,
    itemsExtra: count => `+${count} נוספים`,
    deleteItem: "מחק קנייה",
    clearAll: "מחק את כל ההיסטוריה",
    confirmClear: "האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?",
    toasts: {
      deleted: "הקנייה נמחקה",
      cleared: "כל ההיסטוריה נמחקה",
    },
    emptyState: {
      title: "אין עדיין קניות שנשמרו",
      description: "התחל לסמן פריטים ולשמור קניות כדי לראות אותן כאן.",
      cta: "חזרה לרשימת קניות",
    },
    languageLabel: "English",
    languageAria: "Switch to English",
    currencyLabel: "₪",
    noHistory: "אין היסטוריית קניות",
  },
  en: {
    backAria: "Back to shopping list",
    title: "📊 Shopping History",
    subtitle: "All your purchases in one place",
    compare: "Compare purchases",
    stats: {
      totalPurchases: "Total trips",
      totalSpend: "Total spend",
      averageSpend: "Average per trip",
    },
    summary: {
      heading: "No purchases saved yet",
      description: "Finish a shopping trip to see it here.",
      cta: "Back to shopping list",
    },
    itemsProgress: (completed, total) => `${completed} of ${total} items`,
    itemsExtra: count => `+${count} more`,
    deleteItem: "Delete purchase",
    clearAll: "Clear all history",
    confirmClear: "Are you sure you want to delete all history?",
    toasts: {
      deleted: "Purchase deleted",
      cleared: "History cleared",
    },
    emptyState: {
      title: "No purchases saved yet",
      description: "Finish a shopping trip to see it here.",
      cta: "Back to shopping list",
    },
    languageLabel: "עברית",
    languageAria: "החלף לעברית",
    currencyLabel: "₪",
    noHistory: "No shopping history",
  },
};

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ShoppingHistoryType[]>([]);
  const { language, toggleLanguage } = useLanguage();
  const t = historyTranslations[language];
  const direction = language === "he" ? "rtl" : "ltr";
  const locale = language === "he" ? "he-IL" : "en-US";

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = getShoppingHistory();
    setHistory(data);
  };

  const handleDelete = (id: string) => {
    if (deleteShoppingHistory(id)) {
      toast.success(t.toasts.deleted);
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (!window.confirm(t.confirmClear)) {
      return;
    }
    if (clearAllHistory()) {
      toast.success(t.toasts.cleared);
      loadHistory();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const totalSpent = history.reduce((sum, item) => sum + item.totalAmount, 0);
  const averageSpent = history.length > 0 ? totalSpent / history.length : 0;
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950" dir={direction} lang={language}>
      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 animate-fade-in space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[220px]">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              aria-label={t.backAria}
              className="h-11 w-11 p-0 flex-shrink-0"
            >
              <ArrowRight className={`h-6 w-6 ${language === "en" ? "rotate-180" : ""}`} />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary leading-tight">{t.title}</h1>
              <p className="text-muted-foreground text-sm sm:text-base">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleLanguage}
              aria-label={t.languageAria}
              className="h-10 px-4 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t.languageLabel}
            </Button>
            {history.length > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate("/compare")}
                className="h-11 px-4 sm:px-6 font-semibold shadow-sm hover:shadow-md"
              >
                <TrendingUp className="ml-2 h-5 w-5" />
                {t.compare}
              </Button>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">{t.stats.totalPurchases}</p>
              </div>
              <p className="text-3xl font-bold text-primary">{history.length}</p>
            </Card>
            <Card className="p-5 sm:p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-success" />
                <p className="text-sm font-medium text-muted-foreground">{t.stats.totalSpend}</p>
              </div>
              <p className="text-3xl font-bold text-success">{currencyFormatter.format(totalSpent)}</p>
            </Card>
            <Card className="p-5 sm:p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-warning" />
                <p className="text-sm font-medium text-muted-foreground">{t.stats.averageSpend}</p>
              </div>
              <p className="text-3xl font-bold text-warning">{currencyFormatter.format(averageSpent)}</p>
            </Card>
          </div>
        )}

        {history.length === 0 ? (
          <Card className="p-10 text-center rounded-3xl shadow-lg">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold mb-2">{t.emptyState.title}</h3>
            <p className="text-muted-foreground mb-6">{t.emptyState.description}</p>
            <Button onClick={() => navigate("/")} className="h-12 px-8 text-base">
              {t.emptyState.cta}
            </Button>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {history.map(item => (
                <Card key={item.id} className="p-5 sm:p-6 hover:shadow-lg transition-all rounded-3xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <ShoppingCart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold">{item.store || t.noHistory}</h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <span>{t.itemsProgress(item.completedItems, item.totalItems)}</span>
                        </div>
                        <div className="font-bold text-lg text-primary">
                          {currencyFormatter.format(item.totalAmount)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.items.slice(0, 5).map(shopItem => (
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
                            {t.itemsExtra(item.items.length - 5)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      aria-label={t.deleteItem}
                      className="h-10 w-10 self-end sm:self-start hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="w-full sm:w-auto h-11 px-6 font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive rounded-full"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                {t.clearAll}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
