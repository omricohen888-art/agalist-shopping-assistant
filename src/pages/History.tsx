import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Trash2, Calendar as CalendarIcon, ShoppingCart, DollarSign, TrendingUp, List, X } from "lucide-react";
import { getShoppingHistory, deleteShoppingHistory, clearAllHistory } from "@/utils/storage";
import { ShoppingHistory as ShoppingHistoryType, SHOPPING_TYPES } from "@/types/shopping";
import { toast } from "sonner";
import { useGlobalLanguage, Language } from "@/context/LanguageContext";
import { getStoreLogo } from "@/data/storeLogos";
import { Calendar } from "@/components/ui/calendar";

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
    calendarView: string;
    listView: string;
    showAll: string;
    dailySummary: string;
    purchasesOnDay: (count: number) => string;
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
    calendarView: "תצוגת לוח שנה",
    listView: "תצוגת רשימה",
    showAll: "הצג הכל",
    dailySummary: "סיכום יומי",
    purchasesOnDay: (count) => `${count} קניות ביום זה`,
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
    calendarView: "Calendar view",
    listView: "List view",
    showAll: "Show all",
    dailySummary: "Daily summary",
    purchasesOnDay: (count) => `${count} purchases on this day`,
  },
};

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ShoppingHistoryType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const { language } = useGlobalLanguage();
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

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Get dates with purchases for calendar highlighting
  const datesWithPurchases = useMemo(() => {
    const dates = new Set<string>();
    history.forEach(item => {
      const date = new Date(item.date);
      date.setHours(0, 0, 0, 0);
      dates.add(date.toDateString());
    });
    return dates;
  }, [history]);

  // Filter history by selected date
  const filteredHistory = useMemo(() => {
    if (!selectedDate) return history;
    return history.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.toDateString() === selectedDate.toDateString();
    });
  }, [history, selectedDate]);

  // Daily summary for selected date
  const dailySummary = useMemo(() => {
    if (!selectedDate) return null;
    const dayItems = history.filter(item =>
      new Date(item.date).toDateString() === selectedDate.toDateString()
    );
    return {
      count: dayItems.length,
      total: dayItems.reduce((sum, item) => sum + item.totalAmount, 0)
    };
  }, [history, selectedDate]);

  const totalSpent = history.reduce((sum, item) => sum + item.totalAmount, 0);
  const averageSpent = history.length > 0 ? totalSpent / history.length : 0;
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 2,
  });

  // Custom day content for calendar with purchase indicators
  const modifiers = useMemo(() => ({
    hasPurchase: (date: Date) => datesWithPurchases.has(date.toDateString()),
  }), [datesWithPurchases]);

  const modifiersStyles = {
    hasPurchase: {
      position: 'relative' as const,
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir={direction} lang={language}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              aria-label={t.backAria}
              className="h-10 w-10 p-0 rounded-xl hover:bg-muted"
            >
              <ArrowRight className={`h-5 w-5 ${language === "en" ? "rotate-180" : ""}`} />
            </Button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground leading-none">{t.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                {/* View Mode Toggle */}
                <div className="flex bg-muted rounded-xl p-1">
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    className="h-8 w-8 p-0 rounded-lg"
                    title={t.calendarView}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0 rounded-lg"
                    title={t.listView}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/compare")}
                  className="h-9 rounded-xl font-medium"
                >
                  <TrendingUp className={`h-4 w-4 ${language === 'he' ? 'ml-2' : 'mr-2'}`} />
                  {t.compare}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {history.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t.stats.totalPurchases}</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{history.length}</p>
            </div>
            <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-success/10 rounded-xl">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t.stats.totalSpend}</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{currencyFormatter.format(totalSpent)}</p>
            </div>
            <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-warning/10 rounded-xl">
                  <TrendingUp className="h-4 w-4 text-warning" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t.stats.averageSpend}</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{currencyFormatter.format(averageSpent)}</p>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="p-6 sm:p-10 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
            <div className="text-5xl sm:text-6xl mb-4 grayscale opacity-50">🛒</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{t.emptyState.title}</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">{t.emptyState.description}</p>
            <Button onClick={() => navigate("/")} className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium rounded-xl">
              {t.emptyState.cta}
            </Button>
          </div>
        ) : (
          <>
            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="mx-auto pointer-events-auto"
                    modifiers={modifiers}
                    modifiersClassNames={{
                      hasPurchase: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full"
                    }}
                    locale={language === 'he' ? undefined : undefined}
                  />
                </div>

                {/* Daily Summary */}
                {selectedDate && dailySummary && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{formatShortDate(selectedDate)}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDate(undefined)}
                        className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {dailySummary.count > 0 ? (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{t.purchasesOnDay(dailySummary.count)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-success" />
                          <span className="font-semibold text-foreground">{currencyFormatter.format(dailySummary.total)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{language === 'he' ? 'אין קניות ביום זה' : 'No purchases on this day'}</p>
                    )}
                  </div>
                )}

                {/* Show All button when date is selected */}
                {selectedDate && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(undefined)}
                      className="rounded-xl"
                    >
                      {t.showAll}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* History List */}
            <div className="space-y-4">
              {filteredHistory.length === 0 && selectedDate ? (
                <div className="p-6 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
                  <p className="text-muted-foreground">{language === 'he' ? 'אין קניות ביום זה' : 'No purchases on this day'}</p>
                </div>
              ) : (
                filteredHistory.map(item => (
                  <div key={item.id} className="group p-5 sm:p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 text-foreground">
                            {getStoreLogo(item.store)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {item.listName || item.store || t.noHistory}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <CalendarIcon className="h-4 w-4" />
                              {formatDate(item.date)}
                              {item.shoppingType && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
                                  {SHOPPING_TYPES.find(st => st.value === item.shoppingType)?.icon} {language === 'he' ? SHOPPING_TYPES.find(st => st.value === item.shoppingType)?.labelHe : SHOPPING_TYPES.find(st => st.value === item.shoppingType)?.labelEn}
                                </span>
                              )}
                              {item.listName && item.store && (
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <span className="w-4 h-4">{getStoreLogo(item.store)}</span>
                                  {item.store}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-success" />
                            <span>{t.itemsProgress(item.completedItems, item.totalItems)}</span>
                          </div>
                          <div className="font-semibold text-lg text-primary bg-primary/10 px-2 py-1 rounded-lg">
                            {currencyFormatter.format(item.totalAmount)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.items.slice(0, 5).map(shopItem => (
                            <span
                              key={shopItem.id}
                              className={`text-xs font-medium px-2 py-1 rounded-lg ${shopItem.checked
                                  ? "bg-success/10 text-success"
                                  : "bg-muted text-muted-foreground"
                                }`}
                            >
                              {shopItem.checked && "✓ "}
                              {shopItem.text}
                            </span>
                          ))}
                          {item.items.length > 5 && (
                            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-muted text-muted-foreground">
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
                        className="h-10 w-10 self-end sm:self-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="h-11 px-6 font-medium text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
              >
                <Trash2 className={`h-4 w-4 ${language === 'he' ? 'ml-2' : 'mr-2'}`} />
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