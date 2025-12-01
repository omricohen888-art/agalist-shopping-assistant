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
    <div className="min-h-screen bg-background pb-20" dir={direction} lang={language}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b-2 border-black dark:border-slate-700">
        <div className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Button
                variant="ghost"
                onClick={() => navigate("/")}
                aria-label={t.backAria}
                className="h-10 w-10 p-0 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                >
                <ArrowRight className={`h-6 w-6 ${language === "en" ? "rotate-180" : ""}`} />
                </Button>
                <div>
                <h1 className="text-xl sm:text-2xl font-black text-foreground leading-none">{t.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-bold">{t.subtitle}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="hidden sm:flex h-9 border-2 border-black dark:border-slate-700 font-bold hover:bg-black/5 dark:hover:bg-white/10"
                >
                {t.languageLabel}
                </Button>
                {history.length > 0 && (
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate("/compare")}
                    className="h-9 bg-primary text-primary-foreground border-2 border-black dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                >
                    <TrendingUp className="ml-2 h-4 w-4" />
                    {t.compare}
                </Button>
                )}
            </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {history.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-[#FEFCE8] dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-400 rounded-lg border-2 border-black dark:border-slate-900">
                    <ShoppingCart className="h-4 w-4 text-black" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">{t.stats.totalPurchases}</p>
              </div>
              <p className="text-3xl font-black text-foreground">{history.length}</p>
            </div>
            <div className="p-5 bg-[#F0FDF4] dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-400 rounded-lg border-2 border-black dark:border-slate-900">
                    <DollarSign className="h-4 w-4 text-black" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">{t.stats.totalSpend}</p>
              </div>
              <p className="text-3xl font-black text-foreground">{currencyFormatter.format(totalSpent)}</p>
            </div>
            <div className="p-5 bg-[#FFF7ED] dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-400 rounded-lg border-2 border-black dark:border-slate-900">
                    <TrendingUp className="h-4 w-4 text-black" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">{t.stats.averageSpend}</p>
              </div>
              <p className="text-3xl font-black text-foreground">{currencyFormatter.format(averageSpent)}</p>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="p-10 text-center rounded-3xl border-2 border-dashed border-black/20 dark:border-white/20">
            <div className="text-6xl mb-4 grayscale opacity-50">🛒</div>
            <h3 className="text-2xl font-black mb-2">{t.emptyState.title}</h3>
            <p className="text-muted-foreground mb-6 font-medium">{t.emptyState.description}</p>
            <Button onClick={() => navigate("/")} className="h-12 px-8 text-base font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              {t.emptyState.cta}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} className="group p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary border-2 border-black dark:border-slate-700 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <ShoppingCart className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-foreground">{item.store || t.noHistory}</h3>
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground flex-wrap">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md border border-black/5 dark:border-white/5">
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <span>{t.itemsProgress(item.completedItems, item.totalItems)}</span>
                        </div>
                        <div className="font-black text-lg text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                          {currencyFormatter.format(item.totalAmount)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.items.slice(0, 5).map(shopItem => (
                          <span
                            key={shopItem.id}
                            className={`text-xs font-bold px-2 py-1 rounded-md border ${
                              shopItem.checked
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted text-muted-foreground border-black/5 dark:border-white/5"
                            }`}
                          >
                            {shopItem.checked && "✓ "}
                            {shopItem.text}
                          </span>
                        ))}
                        {item.items.length > 5 && (
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground border border-black/5 dark:border-white/5">
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
                      className="h-10 w-10 self-end sm:self-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="h-11 px-6 font-bold text-destructive border-2 border-destructive/20 hover:bg-destructive/10 hover:border-destructive rounded-xl transition-all"
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
